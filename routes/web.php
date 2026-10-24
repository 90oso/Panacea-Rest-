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
            $room['areas'][] = ['id' => $area->id, 'name' => $area->name, 'has_saved_plan' => !is_null($area->floor_plan), 'layout' => data_get($area->floor_plan, 'panacea_layout', [])];
            foreach ($area->getTablesForFloorPlan() as $table) {
                $room['tables'][] = [
                    'id' => (int) $table['id'],
                    'area_id' => (int) $area->id,
                    'name' => (string) $table['name'],
                    'capacity' => (int) $table['capacity'],
                    'description' => (string) $table['description'],
                    'shape' => (string) $table['shape'],
                ];
            }
        }
    } catch (\Throwable $e) {
        report($e);
        $room['error'] = 'No se pudo cargar el plano real. Revisa los registros del servidor.';
    }
    return view('panacea.preview', ['panaceaData' => $data, 'panaceaRoom' => $room]);
})->name('panacea.preview');

Route::get('/panacea-operations', fn () => redirect('/admin'))->name('panacea.operations');


// Local-only layout editor. Authenticated production endpoints will be separate.
Route::post('/panacea-preview/floor-plan', function (\Illuminate\Http\Request $request) {
    abort_unless(app()->environment('local'), 404);
    $validated = $request->validate([
        'area_id' => ['required', 'integer', 'min:1'],
        'positions' => ['required', 'array', 'max:100'],
        'positions.*.id' => ['required', 'integer', 'min:1'],
        'positions.*.x' => ['required', 'numeric', 'between:0,100'],
        'positions.*.y' => ['required', 'numeric', 'between:0,100'],
    ]);
    $positions = collect($validated['positions']);
    abort_if($positions->pluck('id')->unique()->count() !== $positions->count(), 422, 'Mesas duplicadas');
    return DB::transaction(function () use ($validated, $positions) {
        $area = \Igniter\Reservation\Models\DiningArea::query()->lockForUpdate()->findOrFail($validated['area_id']);
        $allowed = $area->available_tables->pluck('id')->map(fn ($id) => (int) $id);
        abort_if($positions->pluck('id')->diff($allowed)->isNotEmpty(), 422, 'Una mesa no pertenece al área');
        $plan = $area->floor_plan ?? [];
        abort_unless(is_array($plan), 422, 'Formato de plano no compatible');
        $plan['panacea_layout'] = $positions->mapWithKeys(fn ($p) => [(string) $p['id'] => ['x' => round((float) $p['x'], 2), 'y' => round((float) $p['y'], 2)]])->all();
        $area->floor_plan = $plan;
        $area->save();
        return response()->json(['ok' => true, 'layout' => $plan['panacea_layout']]);
    });
})->name('panacea.preview.floor-plan');
