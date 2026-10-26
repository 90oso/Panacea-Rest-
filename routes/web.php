<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

// Local development operations studio. Real operations are not production endpoints.
Route::get('/panacea-preview', [\App\Http\Controllers\Panacea\StudioController::class, 'index'])->name('panacea.preview');
Route::get('/panacea-preview/state', [\App\Http\Controllers\Panacea\StudioController::class, 'state'])->name('panacea.studio.state');
Route::post('/panacea-preview/action', [\App\Http\Controllers\Panacea\StudioController::class, 'action'])->name('panacea.studio.action');

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
