<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

// Local development showcase only. Never expose operational data publicly.
Route::get('/panacea-preview', function () {
    abort_unless(app()->environment('local'), 404);
    $tables = ['orders', 'menus', 'reservations', 'categories', 'statuses'];
    $data = [];
    foreach ($tables as $table) {
        $data[$table] = ['count' => 0, 'rows' => [], 'columns' => []];
        if (!Schema::hasTable($table)) continue;
        $columns = Schema::getColumnListing($table);
        $data[$table]['columns'] = $columns;
        $data[$table]['count'] = DB::table($table)->count();
        // Read only a small, explicitly whitelisted set of non-personal fields.
        $allowed = [
            'orders' => ['order_id','order_type','order_total','total','status_id','created_at'],
            'menus' => ['menu_id','menu_name','menu_price','price','status','created_at'],
            'reservations' => ['reservation_id','reserve_date','reserve_time','status_id','created_at'],
            'categories' => ['category_id','name','category_name'],
            'statuses' => ['status_id','status_name','status_for','status_color'],
        ][$table];
        $selected = array_values(array_intersect($allowed, $columns));
        if ($selected) {
            $query = DB::table($table)->select($selected);
            $order = collect(['created_at','order_id','reservation_id','menu_id','category_id','status_id'])
                ->first(fn ($column) => in_array($column, $columns, true));
            if ($order) $query->orderByDesc($order);
            $data[$table]['rows'] = $query->limit(30)->get();
        }
    }
    // Read-only floor-plan snapshot from TastyIgniter's native reservation models.
    // Occupancy is deliberately unknown until an authoritative service state is integrated.
    $room = ['areas' => [], 'tables' => [], 'error' => null];
    try {
        $areas = \Igniter\Reservation\Models\DiningArea::with('available_tables')->get();
        foreach ($areas as $area) {
            $room['areas'][] = ['id' => $area->id, 'name' => $area->name, 'has_saved_plan' => !is_null($area->floor_plan), 'elements' => Schema::hasTable('panacea_floor_elements') ? DB::table('panacea_floor_elements')->where('dining_area_id', $area->id)->get(['kind','x','y','width','height','label'])->toArray() : []];
            foreach ($area->getTablesForFloorPlan() as $table) {
                $room['tables'][] = [
                    'id' => (int) $table['id'],
                    'area_id' => (int) $area->id,
                    'name' => (string) $table['name'],
                    'capacity' => (int) $table['capacity'],
                    'description' => (string) $table['description'],
                    'shape' => (string) $table['shape'],
                    'seatLayout' => $table['seatLayout'] ?? null,
                    'min_capacity' => (int) ($area->dining_tables()->find($table['id'])?->min_capacity ?? 1),
                ];
            }
        }
    } catch (\Throwable $e) {
        report($e);
        $room['error'] = 'No se pudo cargar el plano real. Revisa los registros del servidor.';
    }
    // Read-only operational links. Never infer a free/occupied state from missing rows.
    $room['reservation_links'] = [];
    $room['order_links'] = [];
    try {
        if (Schema::hasTable('reservation_tables') && Schema::hasTable('reservations')) {
            $linkColumns = Schema::getColumnListing('reservation_tables');
            $reservationColumns = Schema::getColumnListing('reservations');
            if (in_array('reservation_id', $linkColumns, true) && in_array('dining_table_id', $linkColumns, true)
                && in_array('reservation_id', $reservationColumns, true)) {
                $fields = array_values(array_intersect(['reservation_id','reserve_date','reserve_time','status_id'], $reservationColumns));
                $reservations = DB::table('reservations')->select($fields)->limit(250)->get()->keyBy('reservation_id');
                $links = DB::table('reservation_tables')->select(['reservation_id','dining_table_id'])->limit(500)->get();
                foreach ($links as $link) {
                    $reservation = $reservations->get($link->reservation_id);
                    if (!$reservation) continue;
                    $room['reservation_links'][] = [
                        'table_id' => (int) $link->dining_table_id,
                        'reservation_id' => (int) $link->reservation_id,
                        'date' => $reservation->reserve_date ?? null,
                        'time' => $reservation->reserve_time ?? null,
                        'status_id' => $reservation->status_id ?? null,
                    ];
                }
            }
        }
        if (Schema::hasTable('orders')) {
            $orderColumns = Schema::getColumnListing('orders');
            if (in_array('table_id', $orderColumns, true)) {
                $fields = array_values(array_intersect(['order_id','table_id','status_id','order_total','created_at'], $orderColumns));
                $room['order_links'] = DB::table('orders')->select($fields)->whereNotNull('table_id')->orderByDesc('order_id')->limit(100)->get();
            }
        }
    } catch (\Throwable $e) {
        report($e);
        $room['operations_error'] = 'No se pudieron cargar todas las asociaciones operativas.';
    }
    return view('panacea.preview', ['panaceaData' => $data, 'panaceaRoom' => $room]);
})->name('panacea.preview');

Route::get('/panacea-operations', fn () => redirect('/admin'))->name('panacea.operations');


// Development-only floor-plan editor; native TastyIgniter seat_layout format.
Route::post('/panacea-preview/floor-plan', function (\Illuminate\Http\Request $request) {
    abort_unless(app()->environment('local'), 404);
    $input = $request->validate([
        'area_id' => ['required', 'integer'],
        'positions' => ['required', 'array', 'max:100'],
        'positions.*.id' => ['required', 'integer'],
        'positions.*.x' => ['required', 'numeric', 'between:-10000,10000'],
        'positions.*.y' => ['required', 'numeric', 'between:-10000,10000'],
        'positions.*.rotation' => ['required', 'numeric', 'between:-360,360'],
        'properties' => ['sometimes', 'array', 'max:100'],
        'properties.*.id' => ['required', 'integer'],
        'properties.*.name' => ['required', 'string', 'max:80'],
        'properties.*.capacity' => ['required', 'integer', 'between:1,100'],
        'properties.*.shape' => ['required', 'in:rectangle,round'],
        'elements' => ['sometimes', 'array', 'max:80'],
        'elements.*.kind' => ['required', 'in:wall,door,window,aisle'],
        'elements.*.x' => ['required', 'numeric', 'between:0,2000'],
        'elements.*.y' => ['required', 'numeric', 'between:0,2000'],
        'elements.*.width' => ['required', 'numeric', 'between:10,2000'],
        'elements.*.height' => ['required', 'numeric', 'between:10,2000'],
        'elements.*.label' => ['nullable', 'string', 'max:80'],
    ]);
    $positions = collect($input['positions']);
    abort_if($positions->pluck('id')->unique()->count() !== $positions->count(), 422, 'Mesas duplicadas');
    return DB::transaction(function () use ($input, $positions) {
        $area = \Igniter\Reservation\Models\DiningArea::query()->lockForUpdate()->findOrFail($input['area_id']);
        $allowed = $area->available_tables->pluck('id')->map(fn ($id) => (int) $id);
        abort_if($positions->pluck('id')->diff($allowed)->isNotEmpty(), 422, 'Mesa ajena al área');
        $properties = collect($input['properties'] ?? []);
        abort_if($properties->pluck('id')->unique()->count() !== $properties->count(), 422, 'Propiedades duplicadas');
        abort_if($properties->pluck('id')->diff($allowed)->isNotEmpty(), 422, 'Mesa ajena al área');
        foreach ($properties as $property) {
            $table = $area->dining_tables()->findOrFail($property['id']);
            abort_if($property['capacity'] < (int) $table->min_capacity, 422, 'Capacidad inferior al mínimo');
            $table->name = $property['name'];
            $table->max_capacity = $property['capacity'];
            $table->shape = $property['shape'];
            $table->save();
        }
        foreach ($positions as $position) {
            $table = $area->dining_tables()->findOrFail($position['id']);
            $layout = is_array($table->seat_layout) ? $table->seat_layout : [];
            $table->seat_layout = array_merge($layout, [
                'id' => 'group-'.$table->id,
                'x' => (float) $position['x'],
                'y' => (float) $position['y'],
                'rotation' => (float) $position['rotation'],
            ]);
            $table->save();
        }
        if (array_key_exists('elements', $input)) {
            abort_unless(Schema::hasTable('panacea_floor_elements'), 503, 'Ejecuta las migraciones');
            DB::table('panacea_floor_elements')->where('dining_area_id', $area->id)->delete();
            foreach ($input['elements'] as $element) {
                DB::table('panacea_floor_elements')->insert(array_merge($element, ['dining_area_id' => $area->id, 'created_at' => now(), 'updated_at' => now()]));
            }
        }
        return response()->json(['ok' => true]);
    });
})->name('panacea.preview.floor-plan');
