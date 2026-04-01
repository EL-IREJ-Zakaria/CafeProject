<?php

declare(strict_types=1);

final class AuthMiddleware
{
    public static function authenticate(): array
    {
        $token = Request::bearerToken();
        if ($token === null) {
            Response::error('Authorization token is required.', 401);
        }

        $appConfig = require __DIR__ . '/../config/app.php';

        try {
            return Jwt::decode($token, $appConfig['jwt_secret']);
        } catch (RuntimeException $exception) {
            Response::error($exception->getMessage(), 401);
        }
    }
}

