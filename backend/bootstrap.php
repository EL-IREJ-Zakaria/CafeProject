<?php

declare(strict_types=1);

$envFile = __DIR__ . '/.env';
if (is_file($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }

        [$key, $value] = array_map('trim', explode('=', $trimmed, 2));
        $value = trim($value, "\"'");

        $_ENV[$key] = $value;
        putenv(sprintf('%s=%s', $key, $value));
    }
}

require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/helpers/Request.php';
require_once __DIR__ . '/helpers/Jwt.php';
require_once __DIR__ . '/helpers/Database.php';
require_once __DIR__ . '/helpers/Cors.php';
require_once __DIR__ . '/models/AdminUser.php';
require_once __DIR__ . '/models/Order.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/OrderController.php';

