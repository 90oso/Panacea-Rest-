<?php

namespace App\Http\Controllers\Panacea;

use App\Http\Controllers\Controller;
use App\Services\Panacea\Operations;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Igniter\Reservation\Models\DiningArea;
use Igniter\Reservation\Models\DiningTable;

/**
 * Customer-facing concept accessible only locally during development.
 * No customer data or operational states are exposed through this controller.
 */
class GuestPortalController extends Controller
{
    private function guard(): void
    {
        abort_unless(app()->environment('local'), 404);
    }

    private function menu(): array
    {
        if (!Schema::hasTable('menus')) return [];
        $columns = Schema::getColumnListing('menus');
        if (count(array_intersect(['menu_id','menu_name','menu_price'], $columns)) !== 3) return [];

        return DB::table('menus')->select('menu_id','menu_name','menu_price')
            ->whereNotNull('menu_price')->orderBy('menu_name')->limit(80)
            ->get()->filter(fn ($row) => is_numeric($row->menu_price) && (float) $row->menu_price >= 0)
            ->map(fn ($row) => [
                'id' => (int) $row->menu_id,
                'name' => (string) $row->menu_name,
                'price' => (float) $row->menu_price,
            ])->values()->all();
    }

    public function index()
    {
        $this->guard();
        return view('panacea.guest', [
            'menuItems' => $this->menu(),
            'bookingUrl' => route('panacea.guest.booking'),
            'studioUrl' => route('panacea.preview'),
        ]);
    }

    public function book(Request $request): JsonResponse
    {
        $this->guard();
        abort_unless(Schema::hasTable('panacea_service_reservations')
            && Schema::hasColumn('panacea_service_reservations','source'), 503,
            'Ejecuta las migraciones de Panacea.');

        $p = $request->validate([
            'guest_name' => ['required','string','min:2','max:100'],
            'email' => ['required','email','max:190'],
            'party_size' => ['required','integer','between:1,16'],
            'reserved_at' => ['required','date'],
            'privacy_consent' => ['required','accepted'],
        ]);

        $start = Carbon::parse($p['reserved_at'], 'America/Panama');
        $current = Carbon::now('America/Panama');
        if ($start->lt($current->copy()->addMinutes(30)) || $start->gt($current->copy()->addDays(60))) {
            throw ValidationException::withMessages(['reserved_at' => [
                'Selecciona una fecha con al menos 30 minutos de antelación y hasta 60 días.'
            ]]);
        }

        $id = DB::transaction(function () use ($p, $start) {
            $ids = [];
            foreach (DiningArea::with('available_tables')->get() as $area) {
                foreach ($area->available_tables as $table) {
                    if ((int) $table->min_capacity <= (int) $p['party_size']
                        && (int) $table->max_capacity >= (int) $p['party_size']) {
                        $ids[] = (int) $table->id;
                    }
                }
            }
            $ids = array_values(array_unique($ids));
            if (!$ids) throw ValidationException::withMessages([
                'party_size' => ['No hay mesas configuradas para ese tamaño de grupo.']
            ]);

            $candidates = DiningTable::query()->whereIn('id', $ids)
                ->orderBy('max_capacity')->orderBy('id')->lockForUpdate()->get();

            foreach ($candidates as $table) {
                if (Operations::hasPanaceaConflict((int) $table->id, $start)
                    || Operations::hasNativeReservationConflict((int) $table->id, $start)) continue;

                $open = DB::table('panacea_service_sessions')
                    ->where('dining_table_id', $table->id)->where('status', 'open')->exists();
                if ($open && $start->lt(Carbon::now('America/Panama')->addMinutes(90))) continue;

                $id = DB::table('panacea_service_reservations')->insertGetId([
                    'dining_table_id' => $table->id,
                    'guest_name' => trim($p['guest_name']),
                    'contact_email' => strtolower(trim($p['email'])),
                    'party_size' => (int) $p['party_size'],
                    'reserved_at' => $start->toDateTimeString(),
                    'duration_minutes' => 90,
                    'source' => 'guest_portal',
                    'status' => 'pending',
                    'notes' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                Operations::audit('guest.booking_requested','reservation',$id,[
                    'party_size' => (int) $p['party_size'], 'source' => 'guest_portal',
                ]);
                return $id;
            }

            throw ValidationException::withMessages(['reserved_at' => [
                'No encontramos una mesa disponible para esa fecha. Elige otro horario.'
            ]]);
        }, 3);

        return response()->json([
            'ok' => true,
            'request_id' => $id,
            'status' => 'pending',
            'message' => 'Solicitud recibida. La reserva todavía no está confirmada.',
        ], 201);
    }
}
