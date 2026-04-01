<?php

declare(strict_types=1);

final class Cors
{
    public static function handle(): void
    {
        $appConfig = require __DIR__ . '/../config/app.php';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = $appConfig['cors_allowed_origins'];

        if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
        } elseif ($origin === '') {
            header('Access-Control-Allow-Origin: *');
        }

        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
        header('Access-Control-Max-Age: 86400');

        if (Request::method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

