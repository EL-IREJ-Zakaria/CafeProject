<?php

declare(strict_types=1);

final class AuthController
{
    public function login(): void
    {
        $payload = Request::input();
        $username = strtolower((string) ($payload['username'] ?? ''));
        $password = (string) ($payload['password'] ?? '');

        $errors = [];
        if (!filter_var($username, FILTER_VALIDATE_EMAIL)) {
            $errors['username'] = 'A valid admin email is required.';
        }

        if ($password === '') {
            $errors['password'] = 'Password is required.';
        }

        if ($errors !== []) {
            Response::error('Login validation failed.', 422, $errors);
        }

        $user = (new AdminUser())->findByUsername($username);
        if ($user === null || !password_verify($password, $user['password_hash'])) {
            Response::error('Invalid credentials.', 401);
        }

        $appConfig = require __DIR__ . '/../config/app.php';
        $issuedAt = time();
        $expiresAt = $issuedAt + $appConfig['jwt_ttl'];

        $token = Jwt::encode([
            'sub' => (int) $user['id'],
            'username' => $user['username'],
            'name' => $user['full_name'],
            'iat' => $issuedAt,
            'exp' => $expiresAt,
        ], $appConfig['jwt_secret']);

        Response::success([
            'token' => $token,
            'expires_at' => date(DATE_ATOM, $expiresAt),
            'admin' => [
                'id' => (int) $user['id'],
                'username' => $user['username'],
                'full_name' => $user['full_name'],
            ],
        ], 'Login successful.');
    }
}

