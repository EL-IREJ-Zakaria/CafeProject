<?php

declare(strict_types=1);

namespace CafeSystem\Core;

use Closure;
use CafeSystem\Shared\Exceptions\HttpException;

final class Router
{
    private array $routes = [];

    public function get(string $path, Closure|array $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, Closure|array $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, Closure|array $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, Closure|array $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    public function dispatch(Request $request): array
    {
        $allowedMethods = [];

        foreach ($this->routes as $route) {
            if (!preg_match($route['pattern'], $request->path(), $matches)) {
                continue;
            }

            $allowedMethods[] = $route['method'];
            if ($route['method'] !== $request->method()) {
                continue;
            }

            $params = [];
            foreach ($matches as $key => $value) {
                if (!is_string($key)) {
                    continue;
                }

                $params[$key] = ctype_digit($value) ? (int) $value : $value;
            }

            return $this->invoke($route['handler'], $request, $params);
        }

        if ($allowedMethods !== []) {
            throw new HttpException(405, 'Method not allowed.');
        }

        throw new HttpException(404, 'Route not found.');
    }

    private function add(string $method, string $path, Closure|array $handler): void
    {
        $normalizedPath = '/' . ltrim($path, '/');
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', rtrim($normalizedPath, '/'));
        $pattern = '#^' . ($pattern === '' ? '/' : $pattern) . '/?$#';

        $this->routes[] = [
            'method' => $method,
            'handler' => $handler,
            'pattern' => $pattern,
        ];
    }

    private function invoke(Closure|array $handler, Request $request, array $params): array
    {
        if ($handler instanceof Closure) {
            return $handler($request, ...array_values($params));
        }

        [$instance, $method] = $handler;
        return $instance->{$method}($request, ...array_values($params));
    }
}
