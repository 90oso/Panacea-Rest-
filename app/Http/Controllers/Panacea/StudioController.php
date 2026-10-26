<?php

namespace App\Http\Controllers\Panacea;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Igniter\Reservation\Models\DiningArea;
use Igniter\Reservation\Models\DiningTable;
use App\Services\Panacea\Operations;

class StudioController extends Controller
{
    private const REQUIRED_TABLES = [
        'panacea_service_reservations', 'panacea_service_sessions',
        'panacea_service_orders', 'panacea_service_order_lines',
        'panacea_service_payments',
    ];

    private function guard(): void
    {
        abort_unless(app()->environment('local'), 404);
    }

    private function ready(): void
    {
        abort_unless(collect(self::REQUIRED_TABLES)->every(fn ($table) => Schema::hasTable($table)),
            503, 'Faltan las migraciones de Panacea. Ejecuta php artisan migrate.');
    }

    public function index()
    {
        $this->guard();
        return view('panacea.studio', [
            'apiState' => route('panacea.studio.state'),
            'apiAction' => route('panacea.studio.action'),
            'floorSaveUrl' => route('panacea.preview.floor-plan'),
        ]);
    }

    public function health(): JsonResponse
    {
        $this->guard();
        $native = [];
        foreach (['menus','dining_tables','dining_areas','reservation_tables','reservations','orders','stocks'] as $table) {
            $native[$table] = Schema::hasTable($table);
        }
        return response()->json([
            'environment' => 'local-development',
            'service_schema_ready' => collect(self::REQUIRED_TABLES)->every(fn ($table) => Schema::hasTable($table)),
            'management_schema_ready' => Operations::ready(),
            'native_tables_present' => $native,
            'guest_portal' => route('panacea.guest.home'),
            'native_integration' => 'read-only links; lifecycle mapping pending',
            'live_payments' => false,
            'tax_invoicing' => false,
            'access_control_for_production' => false,
        ]);
    }

    public function state(): JsonResponse
    {
        $this->guard();
        $areas = [];
        $tables = [];
        foreach (DiningArea::with('available_tables')->get() as $area) {
            $areas[] = [
                'id' => (int) $area->id,
                'name' => (string) $area->name,
                'elements' => Schema::hasTable('panacea_floor_elements')
                    ? DB::table('panacea_floor_elements')->where('dining_area_id', $area->id)
                        ->get(['kind','x','y','width','height','label'])
                    : [],
            ];
            foreach ($area->getTablesForFloorPlan() as $native) {
                $table = $area->dining_tables()->find($native['id']);
                $tables[] = [
                    'id' => (int) $native['id'],
                    'area_id' => (int) $area->id,
                    'name' => (string) $native['name'],
                    'shape' => (string) $native['shape'],
                    'capacity' => (int) $native['capacity'],
                    'min_capacity' => (int) ($table?->min_capacity ?? 1),
                    'seatLayout' => $native['seatLayout'] ?? null,
                ];
            }
        }

        $menus = [];
        if (Schema::hasTable('menus')) {
            $cols = Schema::getColumnListing('menus');
            if (count(array_intersect(['menu_id','menu_name','menu_price'], $cols)) === 3) {
                $menus = DB::table('menus')->select('menu_id', 'menu_name', 'menu_price')
                    ->orderBy('menu_name')->limit(120)->get()
                    ->map(fn ($m) => ['id' => (int) $m->menu_id, 'name' => (string) $m->menu_name,
                        'price' => (float) $m->menu_price]);
            }
        }

        $nativeReservations = [];
        $nativeLinks = [];
        if (Schema::hasTable('reservations')) {
            $cols = Schema::getColumnListing('reservations');
            $selected = array_values(array_intersect(['reservation_id','reserve_date','reserve_time','status_id'], $cols));
            if (in_array('reservation_id', $selected, true)) {
                $nativeReservations = DB::table('reservations')->select($selected)
                    ->orderByDesc('reservation_id')->limit(80)->get();
            }
        }

        if (Schema::hasTable('reservation_tables')) {
            $cols = Schema::getColumnListing('reservation_tables');
            if (in_array('reservation_id', $cols, true) && in_array('dining_table_id', $cols, true)) {
                $nativeLinks = DB::table('reservation_tables')->select('reservation_id','dining_table_id')
                    ->limit(500)->get();
            }
        }

        $migrated = collect(self::REQUIRED_TABLES)->every(fn ($table) => Schema::hasTable($table));
        $reservations = $migrated
            ? DB::table('panacea_service_reservations')->orderBy('reserved_at')->limit(250)->get()
            : [];
        $sessions = $migrated
            ? DB::table('panacea_service_sessions')->orderByDesc('id')->limit(150)->get()
            : [];
        $orders = $migrated
            ? DB::table('panacea_service_orders')->orderByDesc('id')->limit(250)->get()
            : [];
        $lines = $migrated
            ? DB::table('panacea_service_order_lines')->whereIn('order_id', collect($orders)->pluck('id'))
                ->orderBy('id')->get()
            : [];
        $payments = $migrated
            ? DB::table('panacea_service_payments')->whereIn('session_id', collect($sessions)->pluck('id'))
                ->orderByDesc('id')->get()
            : [];

        $extensions = Operations::snapshot();
        $counts = [];
        foreach (['stocks','customers','staffs','orders','menus'] as $name) {
            $counts[$name] = Schema::hasTable($name) ? DB::table($name)->count() : null;
        }

        return response()->json([
            'extensions' => $extensions,
            'source_counts' => $counts,
            'mode' => 'real', 'migrated' => $migrated, 'areas' => $areas, 'tables' => $tables,
            'menus' => $menus, 'native_reservations' => $nativeReservations, 'native_links' => $nativeLinks,
            'reservations' => $reservations, 'sessions' => $sessions,
            'orders' => $orders, 'lines' => $lines, 'payments' => $payments,
        ]);
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['operation' => [$message]]);
    }

    private function lockTable(int $id): DiningTable
    {
        return DiningTable::query()->lockForUpdate()->findOrFail($id);
    }

    private function checkCapacity(DiningTable $table, int $party): void
    {
        if ($party < (int) $table->min_capacity || $party > (int) $table->max_capacity) {
            $this->fail('Cantidad de personas fuera de la capacidad admitida por la mesa.');
        }
    }

    private function outstanding(int $sessionId): int
    {
        $subtotal = DB::table('panacea_service_orders')
            ->where('session_id', $sessionId)->where('status', '!=', 'cancelled')
            ->sum('subtotal');
        $paid = DB::table('panacea_service_payments')->where('session_id', $sessionId)->sum('amount');
        return max(0, (int) round(((float) $subtotal - (float) $paid) * 100));
    }

    public function action(Request $request): JsonResponse
    {
        $this->guard();
        $this->ready();
        $base = $request->validate(['type' => ['required', 'in:reserve,confirm_reservation,cancel_reservation,seat,add_order,advance_order,pay,close,ingredient_create,stock_receive,recipe_set,profile_create,staff_create,incident_create,incident_resolve']]);
        $type = $base['type'];
        $extensions = ['ingredient_create','stock_receive','recipe_set','profile_create','staff_create','incident_create','incident_resolve'];
        if (in_array($type, $extensions, true)) {
            return response()->json(DB::transaction(fn () => Operations::action($request, $type), 3));
        }

        return DB::transaction(function () use ($request, $type) {
            $result = ['ok' => true];
            if ($type === 'reserve') {
                $p = $request->validate([
                    'table_id' => ['required','integer','min:1'],
                    'guest_name' => ['required','string','max:100'],
                    'party_size' => ['required','integer','between:1,50'],
                    'reserved_at' => ['required','date'],
                    'notes' => ['nullable','string','max:255'],
                ]);
                $table = $this->lockTable($p['table_id']);
                $this->checkCapacity($table, $p['party_size']);
                $restaurantTimezone = 'America/Panama';
                $start = Carbon::parse($p['reserved_at'], $restaurantTimezone);
                $restaurantNow = Carbon::now($restaurantTimezone);
                if ($start->lt($restaurantNow) || $start->gt($restaurantNow->copy()->addDays(90))) {
                    $this->fail('La reserva debe estar entre ahora y los próximos 90 días.');
                }
                $conflicts = DB::table('panacea_service_reservations')
                    ->where('dining_table_id', $table->id)->where('status', 'confirmed')
                    ->where('reserved_at', '>', $start->copy()->subMinutes(90))
                    ->where('reserved_at', '<', $start->copy()->addMinutes(90))->exists();
                $nearOpenService = $start->lt(Carbon::now('America/Panama')->addMinutes(90))
                    && DB::table('panacea_service_sessions')->where('dining_table_id', $table->id)
                        ->where('status', 'open')->exists();
                if ($nearOpenService || $conflicts || Operations::hasPanaceaConflict((int) $table->id, $start)
                    || Operations::hasNativeReservationConflict((int) $table->id, $start)) {
                    $this->fail('La mesa tiene otra reserva o un vínculo nativo en ese horario.');
                }
                $result['id'] = DB::table('panacea_service_reservations')->insertGetId([
                    'dining_table_id' => $table->id, 'guest_name' => trim($p['guest_name']),
                    'party_size' => $p['party_size'], 'reserved_at' => $start,
                    'duration_minutes' => 90, 'status' => 'confirmed',
                    'notes' => $p['notes'] ?? null, 'created_at' => now(), 'updated_at' => now(),
                ]);
            } elseif ($type === 'confirm_reservation') {
                $p = $request->validate(['reservation_id' => ['required','integer']]);
                $reservation = DB::table('panacea_service_reservations')
                    ->where('id', $p['reservation_id'])->lockForUpdate()->first();
                abort_unless($reservation, 404);
                if ($reservation->status !== 'pending') $this->fail('Solo se confirman solicitudes pendientes.');
                $table = $this->lockTable((int) $reservation->dining_table_id);
                $start = Carbon::parse($reservation->reserved_at, 'America/Panama');
                if ($start->lt(Carbon::now('America/Panama')->subMinutes(30))) {
                    $this->fail('La solicitud ya pasó su horario; crea una nueva para confirmar.');
                }
                $openNearby = $start->lt(Carbon::now('America/Panama')->addMinutes(90))
                    && DB::table('panacea_service_sessions')->where('dining_table_id', $table->id)
                        ->where('status', 'open')->exists();
                if ($openNearby || Operations::hasPanaceaConflict((int) $table->id, $start, (int) $reservation->id)
                    || Operations::hasNativeReservationConflict((int) $table->id, $start)) {
                    $this->fail('La solicitud coincide con otra reserva.');
                }
                DB::table('panacea_service_reservations')->where('id', $reservation->id)
                    ->update(['status' => 'confirmed','updated_at' => now()]);
                Operations::audit('reservation.confirm', 'reservation', (int) $reservation->id);
            } elseif ($type === 'cancel_reservation') {
                $p = $request->validate(['reservation_id' => ['required','integer']]);
                $reservation = DB::table('panacea_service_reservations')->where('id', $p['reservation_id'])
                    ->lockForUpdate()->first();
                abort_unless($reservation, 404);
                if (!in_array($reservation->status, ['confirmed','pending'], true)) $this->fail('Esta reserva ya no puede cancelarse.');
                DB::table('panacea_service_reservations')->where('id', $reservation->id)
                    ->update(['status' => 'cancelled','updated_at' => now()]);
            } elseif ($type === 'seat') {
                $p = $request->validate([
                    'table_id' => ['required','integer'],
                    'guest_name' => ['required','string','max:100'],
                    'party_size' => ['required','integer','between:1,50'],
                    'reservation_id' => ['nullable','integer'],
                    'guest_profile_id' => ['nullable','integer'],
                ]);
                $table = $this->lockTable($p['table_id']);
                $this->checkCapacity($table, $p['party_size']);
                if (DB::table('panacea_service_sessions')->where('dining_table_id', $table->id)
                    ->where('status', 'open')->exists()) $this->fail('La mesa ya tiene un servicio abierto.');
                $profileId = $p['guest_profile_id'] ?? null;
                if ($profileId && !DB::table('panacea_guest_profiles')->where('id', $profileId)->exists()) {
                    $this->fail('Perfil de cliente no encontrado.');
                }
                $reservationId = $p['reservation_id'] ?? null;
                $timezone = 'America/Panama';
                $localNow = Carbon::now($timezone);
                $nearReservation = DB::table('panacea_service_reservations')
                    ->where('dining_table_id', $table->id)->where('status', 'confirmed')
                    ->whereBetween('reserved_at', [
                        $localNow->copy()->subMinutes(90)->toDateTimeString(),
                        $localNow->copy()->addMinutes(90)->toDateTimeString(),
                    ])->orderBy('reserved_at')->first();
                if ($nearReservation && (int) $reservationId !== (int) $nearReservation->id) {
                    $this->fail('La mesa tiene una reserva próxima. Recibe primero esa reserva.');
                }
                if ($reservationId) {
                    $reservation = DB::table('panacea_service_reservations')->where('id', $reservationId)
                        ->lockForUpdate()->first();
                    if (!$reservation || $reservation->status !== 'confirmed' ||
                        (int) $reservation->dining_table_id !== (int) $table->id) {
                        $this->fail('Reserva inexistente, cancelada o asignada a otra mesa.');
                    }
                    DB::table('panacea_service_reservations')->where('id', $reservationId)
                        ->update(['status' => 'seated', 'updated_at' => now()]);
                }
                if (!$reservationId && Operations::hasNativeReservationConflict((int) $table->id, $localNow)) {
                    $this->fail('Hay una reserva nativa cercana sin estado confirmado.');
                }
                $result['id'] = DB::table('panacea_service_sessions')->insertGetId([
                    'dining_table_id' => $table->id, 'reservation_id' => $reservationId,
                    'guest_profile_id' => $profileId,
                    'guest_name' => trim($p['guest_name']), 'party_size' => $p['party_size'],
                    'status' => 'open', 'opened_at' => now(), 'created_at' => now(), 'updated_at' => now(),
                ]);
            } elseif ($type === 'add_order') {
                $p = $request->validate([
                    'session_id' => ['required','integer'],
                    'items' => ['required','array','min:1','max:30'],
                    'items.*.menu_id' => ['required','integer'],
                    'items.*.qty' => ['required','integer','between:1,30'],
                ]);
                $session = DB::table('panacea_service_sessions')->where('id', $p['session_id'])
                    ->lockForUpdate()->first();
                abort_unless($session, 404);
                if ($session->status !== 'open') $this->fail('El servicio ya está cerrado.');
                $subtotalCents = 0;
                $lines = [];
                foreach ($p['items'] as $item) {
                    $menu = DB::table('menus')->where('menu_id', $item['menu_id'])->first();
                    if (!$menu || !isset($menu->menu_price) || !is_numeric($menu->menu_price) ||
                        (float) $menu->menu_price < 0) $this->fail('Producto o precio no disponible.');
                    $cents = (int) round((float) $menu->menu_price * 100);
                    $subtotalCents += $cents * $item['qty'];
                    $lines[] = ['menu_id' => $menu->menu_id, 'title' => mb_substr((string) $menu->menu_name, 0, 140),
                        'quantity' => $item['qty'], 'unit_price' => number_format($cents / 100, 2, '.', '')];
                }
                $id = DB::table('panacea_service_orders')->insertGetId([
                    'session_id' => $session->id, 'status' => 'pending',
                    'subtotal' => number_format($subtotalCents / 100, 2, '.', ''),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
                foreach ($lines as $line) {
                    DB::table('panacea_service_order_lines')->insert($line + [
                        'order_id' => $id, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                $result['id'] = $id;
            } elseif ($type === 'advance_order') {
                $p = $request->validate(['order_id' => ['required','integer']]);
                $order = DB::table('panacea_service_orders')->where('id', $p['order_id'])
                    ->lockForUpdate()->first();
                abort_unless($order, 404);
                $next = ['pending' => 'preparing', 'preparing' => 'ready', 'ready' => 'served'];
                if (!isset($next[$order->status])) $this->fail('El pedido ya terminó su recorrido.');
                if ($order->status === 'pending') Operations::consumeForOrder((int) $order->id);
                DB::table('panacea_service_orders')->where('id', $order->id)
                    ->update(['status' => $next[$order->status], 'updated_at' => now()]);
            } elseif ($type === 'pay') {
                $p = $request->validate([
                    'session_id' => ['required','integer'],
                    'amount' => ['required','numeric','gt:0','decimal:0,2','max:99999'],
                    'method' => ['required','in:cash,card,other'],
                    'idempotency_key' => ['required','string','max:80','regex:/^[a-zA-Z0-9_-]{16,80}$/'],
                ]);
                $session = DB::table('panacea_service_sessions')->where('id', $p['session_id'])
                    ->lockForUpdate()->first();
                abort_unless($session, 404);
                $existing = DB::table('panacea_service_payments')
                    ->where('idempotency_key', $p['idempotency_key'])->first();
                if ($existing) {
                    if ((int) $existing->session_id !== (int) $session->id) $this->fail('Clave de operación duplicada en otro servicio.');
                    return response()->json(['ok' => true, 'replayed' => true]);
                }
                if ($session->status !== 'open') $this->fail('Servicio cerrado.');
                $due = $this->outstanding((int) $session->id);
                $cents = (int) round((float) $p['amount'] * 100);
                if ($due <= 0 || $cents > $due) $this->fail('El abono supera el saldo pendiente.');
                DB::table('panacea_service_payments')->insert([
                    'session_id' => $session->id,
                    'amount' => number_format($cents / 100, 2, '.', ''),
                    'method' => $p['method'], 'idempotency_key' => $p['idempotency_key'], 'recorded_at' => now(),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            } elseif ($type === 'close') {
                $p = $request->validate(['session_id' => ['required','integer']]);
                $session = DB::table('panacea_service_sessions')->where('id', $p['session_id'])
                    ->lockForUpdate()->first();
                abort_unless($session, 404);
                if ($session->status !== 'open') $this->fail('El servicio ya está cerrado.');
                if ($this->outstanding((int) $session->id) > 0) $this->fail('Hay un saldo pendiente de pago.');
                if (DB::table('panacea_service_orders')->where('session_id', $session->id)
                    ->whereNotIn('status', ['served','cancelled'])->exists()) {
                    $this->fail('Todavía hay pedidos sin entregar.');
                }
                DB::table('panacea_service_sessions')->where('id', $session->id)->update([
                    'status' => 'closed', 'closed_at' => now(), 'updated_at' => now(),
                ]);
                if (!empty($session->guest_profile_id) && Operations::ready()) {
                    DB::table('panacea_guest_profiles')->where('id', $session->guest_profile_id)->increment('visits_count');
                    DB::table('panacea_guest_profiles')->where('id', $session->guest_profile_id)->update([
                        'last_visit_at' => now(),'updated_at' => now(),
                    ]);
                }
            }

            Operations::audit($type, match ($type) {
                'reserve','confirm_reservation','cancel_reservation' => 'reservation',
                'seat','close','pay' => 'service',
                default => 'order',
            }, (int) ($result['id'] ?? $p['reservation_id'] ?? $p['session_id'] ?? $p['order_id'] ?? 0) ?: null);
            return response()->json($result);
        }, 3);
    }
}
