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
    return view('panacea.preview', ['panaceaData' => $data]);
})->name('panacea.preview');

Route::get('/panacea-operations', fn () => redirect('/admin'))->name('panacea.operations');
