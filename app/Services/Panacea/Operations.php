<?php

namespace App\Services\Panacea;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Igniter\Reservation\Models\DiningTable;

/**
 * Local-development operational extensions.
 *
 * Deliberately isolated from TastyIgniter's stock/orders/customers tables until
 * their extension contracts, permission gates and lifecycle are validated.
 */
class Operations
{
    private const TABLES = [
        'panacea_ingredients', 'panacea_recipe_lines', 'panacea_stock_movements',
        'panacea_guest_profiles', 'panacea_staff_directory',
        'panacea_incidents', 'panacea_audit_events',
    ];

    public static function ready(): bool
    {
        return collect(self::TABLES)->every(fn (string $name) => Schema::hasTable($name));
    }

    private static function invalid(string $message): never
    {
        throw ValidationException::withMessages(['operation' => [$message]]);
    }

    public static function audit(string $action, string $type, ?int $id, array $details = []): void
    {
        if (!Schema::hasTable('panacea_audit_events')) return;

        // Never store guest contact information or notes in event details.
        DB::table('panacea_audit_events')->insert([
            'action' => $action,
            'resource_type' => $type,
            'resource_id' => $id,
            'details' => json_encode($details, JSON_THROW_ON_ERROR),
            'occurred_at' => now(),
        ]);
    }

    public static function snapshot(): array
    {
        if (!self::ready()) return ['ready' => false];

        $ingredients = DB::table('panacea_ingredients as i')
            ->leftJoin('panacea_stock_movements as m', 'm.ingredient_id', '=', 'i.id')
            ->groupBy('i.id', 'i.name', 'i.unit', 'i.min_stock', 'i.unit_cost', 'i.active', 'i.created_at', 'i.updated_at')
            ->select('i.id', 'i.name', 'i.unit', 'i.min_stock', 'i.unit_cost', 'i.active')
            ->selectRaw('COALESCE(SUM(m.quantity_delta), 0) as stock')
            ->orderBy('i.name')->limit(250)->get();

        $recipes = DB::table('panacea_recipe_lines')
            ->select('id','menu_id','ingredient_id','quantity')->orderBy('menu_id')->limit(500)->get();
        $movements = DB::table('panacea_stock_movements')
            ->orderByDesc('id')->limit(80)
            ->get(['id','ingredient_id','kind','quantity_delta','unit_cost','order_line_id','created_at']);
        $customers = DB::table('panacea_guest_profiles')->select([
            'id','display_name','contact_opt_in','visits_count','last_visit_at'
        ])->orderByDesc('visits_count')->limit(120)->get();
        $staff = DB::table('panacea_staff_directory')->select([
            'id','display_name','role','shift_label','active'
        ])->orderBy('display_name')->limit(100)->get();
        $incidents = DB::table('panacea_incidents')->select([
            'id','title','severity','status','owner_label','dining_table_id','created_at','resolved_at'
        ])->orderByDesc('id')->limit(150)->get();
        $audit = DB::table('panacea_audit_events')
            ->select(['id','action','resource_type','resource_id','occurred_at'])
            ->orderByDesc('id')->limit(40)->get();

        $costs = DB::table('panacea_stock_movements')
            ->where('kind', 'consume')
            ->selectRaw('COALESCE(SUM(-quantity_delta * unit_cost), 0) as total')
            ->first();
        $nonRecipeLines = DB::table('panacea_service_order_lines as l')
            ->leftJoin('panacea_recipe_lines as r', 'r.menu_id', '=', 'l.menu_id')
            ->whereNull('r.id')->count();

        return [
            'ready' => true, 'ingredients' => $ingredients, 'recipes' => $recipes,
            'movements' => $movements, 'customers' => $customers, 'staff' => $staff,
            'incidents' => $incidents, 'audit' => $audit,
            'cost_totals' => [
                'consumed' => round((float) ($costs->total ?? 0), 2),
                'uncosted_order_lines' => $nonRecipeLines,
            ],
        ];
    }

    public static function hasNativeReservationConflict(int $tableId, Carbon $start): bool
    {
        if (!Schema::hasTable('reservation_tables') || !Schema::hasTable('reservations')) return false;
        $linkColumns = Schema::getColumnListing('reservation_tables');
        $columns = Schema::getColumnListing('reservations');

        foreach (['reservation_id', 'dining_table_id'] as $col) {
            if (!in_array($col, $linkColumns, true)) return false;
        }
        foreach (['reservation_id', 'reserve_date', 'reserve_time'] as $col) {
            if (!in_array($col, $columns, true)) return false;
        }

        // Status codes are not mapped yet. Conservative: a linked native
        // reservation blocks the time slot until status semantics are verified.
        $native = DB::table('reservation_tables as rt')
            ->join('reservations as r', 'r.reservation_id', '=', 'rt.reservation_id')
            ->where('rt.dining_table_id', $tableId)
            ->whereBetween('r.reserve_date', [
                $start->copy()->subDay()->toDateString(),
                $start->copy()->addDay()->toDateString(),
            ])
            ->limit(100)->get(['r.reserve_date','r.reserve_time']);

        foreach ($native as $item) {
            try {
                $nativeStart = Carbon::parse((string) $item->reserve_date.' '.(string) $item->reserve_time, 'America/Panama');
                if (abs($nativeStart->diffInMinutes($start, false)) < 90) return true;
            } catch (\Throwable $exception) {
                // Unknown native date format must not silently grant availability.
                return true;
            }
        }
        return false;
    }

    public static function hasPanaceaConflict(int $tableId, Carbon $start, ?int $excludingId = null): bool
    {
        $query = DB::table('panacea_service_reservations')
            ->where('dining_table_id', $tableId)
            ->whereIn('status', ['pending','confirmed'])
            ->where('reserved_at', '>', $start->copy()->subMinutes(90)->toDateTimeString())
            ->where('reserved_at', '<', $start->copy()->addMinutes(90)->toDateTimeString());
        if ($excludingId) $query->where('id', '!=', $excludingId);
        return $query->exists();
    }

    /**
     * Take a cost snapshot and decrement shadow inventory when kitchen starts
     * preparation. The native TastyIgniter stock subsystem is not altered.
     *
     * Guarded by locked order, ingredient rows, and a unique movement key.
     */
    public static function consumeForOrder(int $orderId): void
    {
        if (!self::ready()) return;

        $lines = DB::table('panacea_service_order_lines')->where('order_id', $orderId)
            ->orderBy('id')->get(['id', 'menu_id', 'quantity']);

        $items = [];
        foreach ($lines as $line) {
            $recipe = DB::table('panacea_recipe_lines')->where('menu_id', $line->menu_id)
                ->orderBy('ingredient_id')->get(['ingredient_id','quantity']);
            foreach ($recipe as $part) {
                $already = DB::table('panacea_stock_movements')
                    ->where('order_line_id', $line->id)->where('ingredient_id', $part->ingredient_id)
                    ->exists();
                if ($already) continue;
                $amount = round((float) $part->quantity * (int) $line->quantity, 3);
                if ($amount <= 0) continue;
                $items[] = ['ingredient_id' => (int) $part->ingredient_id, 'line_id' => (int) $line->id, 'quantity' => $amount];
            }
        }
        $byId = collect($items)->groupBy('ingredient_id')->sortKeys();
        if ($byId->isEmpty()) return;

        $ingredientIds = $byId->keys()->all();
        $locked = DB::table('panacea_ingredients')->whereIn('id', $ingredientIds)
            ->orderBy('id')->lockForUpdate()->get()->keyBy('id');
        foreach ($byId as $ingredientId => $parts) {
            $ingredient = $locked->get($ingredientId);
            if (!$ingredient || !$ingredient->active) self::invalid('La receta utiliza un ingrediente inactivo.');
            $onHand = (float) DB::table('panacea_stock_movements')
                ->where('ingredient_id', $ingredientId)->sum('quantity_delta');
            $required = round($parts->sum('quantity'), 3);
            if ($onHand + 0.0001 < $required) {
                self::invalid('Existencia insuficiente de '.$ingredient->name.' ('.round($onHand, 3).' / '.$required.' '.$ingredient->unit.').');
            }
        }

        foreach ($items as $part) {
            $ingredient = $locked->get($part['ingredient_id']);
            DB::table('panacea_stock_movements')->insert([
                'ingredient_id' => $part['ingredient_id'],
                'kind' => 'consume',
                'quantity_delta' => -$part['quantity'],
                'unit_cost' => $ingredient->unit_cost,
                'order_line_id' => $part['line_id'],
                'note' => 'Preparación de comanda #'.$orderId,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        self::audit('inventory.consume', 'order', $orderId, ['movements' => count($items)]);
    }

    public static function action(Request $request, string $type): array
    {
        if (!self::ready()) self::invalid('Ejecuta php artisan migrate para habilitar inventario y gerencia.');
        $result = ['ok' => true];

        switch ($type) {
            case 'ingredient_create':
                $p = $request->validate([
                    'name' => ['required','string','max:120'],
                    'unit' => ['required','in:unidad,g,kg,ml,L'],
                    'min_stock' => ['required','numeric','between:0,100000'],
                    'unit_cost' => ['required','numeric','between:0,100000'],
                ]);
                $id = DB::table('panacea_ingredients')->insertGetId($p + ['active' => true,'created_at'=>now(),'updated_at'=>now()]);
                self::audit('ingredient.create', 'ingredient', $id);
                $result['id'] = $id;
                break;

            case 'stock_receive':
                $p = $request->validate([
                    'ingredient_id' => ['required','integer'],
                    'quantity' => ['required','numeric','gt:0','max:100000'],
                    'unit_cost' => ['required','numeric','between:0,100000'],
                    'note' => ['nullable','string','max:180'],
                ]);
                $ingredient = DB::table('panacea_ingredients')->where('id', $p['ingredient_id'])
                    ->lockForUpdate()->first();
                if (!$ingredient || !$ingredient->active) self::invalid('Ingrediente no disponible.');
                DB::table('panacea_stock_movements')->insert([
                    'ingredient_id' => $ingredient->id, 'kind' => 'receive',
                    'quantity_delta' => round((float) $p['quantity'], 3),
                    'unit_cost' => $p['unit_cost'], 'order_line_id' => null,
                    'note' => $p['note'] ?? null, 'created_at' => now(),'updated_at' => now(),
                ]);
                DB::table('panacea_ingredients')->where('id', $ingredient->id)
                    ->update(['unit_cost' => $p['unit_cost'], 'updated_at' => now()]);
                self::audit('inventory.receive', 'ingredient', (int) $ingredient->id, ['quantity' => (float) $p['quantity']]);
                break;

            case 'recipe_set':
                $p = $request->validate([
                    'menu_id' => ['required','integer'],
                    'ingredient_id' => ['required','integer'],
                    'quantity' => ['required','numeric','gt:0','max:100000'],
                ]);
                if (!DB::table('menus')->where('menu_id', $p['menu_id'])->exists()) self::invalid('Producto nativo no encontrado.');
                if (!DB::table('panacea_ingredients')->where('id', $p['ingredient_id'])->where('active', true)->exists()) self::invalid('Ingrediente no encontrado.');
                DB::table('panacea_recipe_lines')->updateOrInsert(
                    ['menu_id' => $p['menu_id'], 'ingredient_id' => $p['ingredient_id']],
                    ['quantity' => round((float) $p['quantity'], 3), 'updated_at' => now(), 'created_at' => now()]
                );
                self::audit('recipe.set', 'menu', (int) $p['menu_id'], ['ingredient_id' => $p['ingredient_id']]);
                break;

            case 'profile_create':
                $p = $request->validate([
                    'display_name' => ['required','string','max:100'],
                    'contact_opt_in' => ['required','boolean'],
                ]);
                $id = DB::table('panacea_guest_profiles')->insertGetId($p + [
                    'visits_count'=>0,'last_visit_at'=>null,'created_at'=>now(),'updated_at'=>now(),
                ]);
                self::audit('customer.create', 'guest_profile', $id, ['opt_in' => (bool) $p['contact_opt_in']]);
                $result['id'] = $id;
                break;

            case 'staff_create':
                $p = $request->validate([
                    'display_name' => ['required','string','max:100'],
                    'role' => ['required','in:manager,reception,service,kitchen,cashier'],
                    'shift_label' => ['nullable','string','max:80'],
                ]);
                $id = DB::table('panacea_staff_directory')->insertGetId($p + ['active'=>true,'created_at'=>now(),'updated_at'=>now()]);
                self::audit('staff.create', 'staff', $id, ['role' => $p['role']]);
                $result['id'] = $id;
                break;

            case 'incident_create':
                $p = $request->validate([
                    'title' => ['required','string','max:140'],
                    'severity' => ['required','in:low,medium,high'],
                    'owner_label' => ['nullable','string','max:80'],
                    'dining_table_id' => ['nullable','integer'],
                ]);
                if (!empty($p['dining_table_id']) && !DiningTable::find($p['dining_table_id'])) self::invalid('Mesa no encontrada.');
                $id = DB::table('panacea_incidents')->insertGetId($p + ['status'=>'open','created_at'=>now(),'updated_at'=>now()]);
                self::audit('incident.create', 'incident', $id);
                $result['id'] = $id;
                break;

            case 'incident_resolve':
                $p = $request->validate(['incident_id' => ['required','integer']]);
                $incident = DB::table('panacea_incidents')->where('id', $p['incident_id'])->lockForUpdate()->first();
                if (!$incident || $incident->status !== 'open') self::invalid('La incidencia ya no está abierta.');
                DB::table('panacea_incidents')->where('id', $incident->id)
                    ->update(['status'=>'resolved','resolved_at'=>now(),'updated_at'=>now()]);
                self::audit('incident.resolve', 'incident', (int) $incident->id);
                break;

            default:
                self::invalid('Operación no soportada.');
        }

        return $result;
    }
}
