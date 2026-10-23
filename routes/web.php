<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Panacea Restaurant preview
|--------------------------------------------------------------------------
| A separate, read-only branded presentation. TastyIgniter's installed
| routes remain untouched. Never intercept the storefront's '/' route.
*/
Route::view('/panacea-preview', 'panacea.preview')->name('panacea.preview');
