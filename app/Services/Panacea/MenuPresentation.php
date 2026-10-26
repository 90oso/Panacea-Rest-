<?php

namespace App\Services\Panacea;

use Illuminate\Support\Facades\Log;
use Igniter\Cart\Models\Menu;

/**
 * Adds the genuine TastyIgniter menu-item photo to small presentation payloads.
 * Absence of a native image is represented as null; the UI labels its illustrative
 * fallback instead of passing stock photography off as the customer's dish.
 *
 * No menu prices, status or stock values are changed by this service.
 */
final class MenuPresentation
{
    public static function withPhotos(array $items): array
    {
        if ($items === []) return [];

        $ids = collect($items)->pluck('id')->map(fn ($id) => (int) $id)->filter()->unique()->values()->all();
        $photos = [];

        try {
            // Native TastyIgniter 4.x Cart Menu uses the HasMedia trait and
            // declares "thumb" as its singular media attachment.
            $menus = Menu::query()->with('media')->whereIn('menu_id', $ids)->get();
            foreach ($menus as $menu) {
                $photo = $menu->thumb;
                if (!$photo || !is_object($photo) || !method_exists($photo, 'getThumb')) continue;

                try {
                    $url = (string) $photo->getThumb(['width' => 800, 'height' => 580]);
                    if (self::safeImageUrl($url)) $photos[(int) $menu->menu_id] = $url;
                } catch (\Throwable $exception) {
                    // Broken attachment must not take the public menu offline.
                    Log::warning('Panacea could not render one menu photo', [
                        'menu_id' => $menu->menu_id,
                        'message' => $exception->getMessage(),
                    ]);
                }
            }
        } catch (\Throwable $exception) {
            Log::warning('Panacea cannot read native menu media; using illustrative cards', [
                'message' => $exception->getMessage(),
            ]);
        }

        return array_map(static function (array $item) use ($photos): array {
            $url = $photos[(int) $item['id']] ?? null;

            return array_merge($item, [
                'image' => $url,
                'image_source' => $url ? 'native' : null,
            ]);
        }, $items);
    }

    private static function safeImageUrl(string $url): bool
    {
        $url = trim($url);
        if ($url === '' || strlen($url) > 2048) return false;
        if (str_starts_with($url, '/') && !str_starts_with($url, '//')) return true;

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
        return in_array($scheme, ['http', 'https'], true)
            && (bool) filter_var($url, FILTER_VALIDATE_URL);
    }
}
