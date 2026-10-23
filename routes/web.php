<?php

use Illuminate\Support\Facades\Route;

// Standalone Panacea presentation, isolated from TastyIgniter storefront.
Route::view('/panacea-preview', 'panacea.preview')->name('panacea.preview');

// Operational entry point: require a signed-in administrator and use the
// native TastyIgniter administration rather than a fake order database.
// The backend URL can be configured if an installation customizes its slug.
Route::get('/panacea-operations', function () {
    $target = trim((string) config('panacea.admin_path', 'admin'), '/');
    if ($target === '' || !preg_match('/^[a-zA-Z0-9_\/-]+$/', $target)) {
        abort(500, 'Invalid administration path configuration');
    }

    return redirect('/'.$target);
})->name('panacea.operations');
