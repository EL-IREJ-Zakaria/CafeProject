<?php

declare(strict_types=1);

return [
    ['method' => 'GET', 'pattern' => '#^/api/health$#', 'handler' => static function (): void {
        Response::success([
            'service' => 'Cafe Ordering API',
            'timestamp' => date(DATE_ATOM),
        ], 'API is healthy.');
    }],
    ['method' => 'POST', 'pattern' => '#^/api/auth/login$#', 'handler' => [AuthController::class, 'login']],
    ['method' => 'POST', 'pattern' => '#^/api/orders$#', 'handler' => [OrderController::class, 'create']],
    ['method' => 'GET', 'pattern' => '#^/api/orders$#', 'handler' => [OrderController::class, 'index']],
    ['method' => 'GET', 'pattern' => '#^/api/orders/pending$#', 'handler' => [OrderController::class, 'pending']],
    ['method' => 'PUT', 'pattern' => '#^/api/orders/(\d+)/status$#', 'handler' => [OrderController::class, 'updateStatus']],
];

