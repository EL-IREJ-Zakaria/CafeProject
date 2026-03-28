<?php

declare(strict_types=1);

$allowedOrigins = array_values(array_filter(array_map(
    static fn (string $origin): string => trim($origin),
    explode(',', (string) env('APP_ALLOWED_ORIGINS', '*'))
)));

return [
    'name' => env('APP_NAME', 'Bean Scene Cafe'),
    'env' => env('APP_ENV', 'local'),
    'timezone' => env('APP_TIMEZONE', 'Africa/Casablanca'),
    'allowed_origins' => $allowedOrigins === [] ? ['*'] : $allowedOrigins,
];
