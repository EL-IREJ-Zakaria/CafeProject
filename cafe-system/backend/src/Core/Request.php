<?php

declare(strict_types=1);

namespace CafeSystem\Core;

use CafeSystem\Shared\Exceptions\ValidationException;

final class Request
{
    public function __construct(
        private readonly string $method,
        private readonly string $path,
        private readonly array $query,
        private readonly array $body,
        private readonly array $server
    ) {
    }

    public static function capture(): self
    {
        $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
        $uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $rawBody = file_get_contents('php://input') ?: '';
        $decodedBody = [];

        if ($rawBody !== '') {
            $decodedBody = json_decode($rawBody, true);

            if ($decodedBody === null && json_last_error() !== JSON_ERROR_NONE) {
                throw new ValidationException('Invalid JSON payload.');
            }
        }

        return new self(
            $method,
            $path,
            $_GET,
            is_array($decodedBody) ? $decodedBody : [],
            $_SERVER
        );
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function body(): array
    {
        return $this->body;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function header(string $name, mixed $default = null): mixed
    {
        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $this->server[$serverKey] ?? $default;
    }
}
