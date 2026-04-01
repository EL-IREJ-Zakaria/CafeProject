<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

Cors::handle();

$method = Request::method();
$path = Request::path();
$routes = require __DIR__ . '/routes/api.php';

foreach ($routes as $route) {
    if ($route['method'] !== $method) {
        continue;
    }

    if (preg_match($route['pattern'], $path, $matches) !== 1) {
        continue;
    }

    $handler = $route['handler'];
    array_shift($matches);

    try {
        if (is_callable($handler)) {
            $handler(...$matches);
        } else {
            [$class, $action] = $handler;
            $controller = new $class();
            $controller->$action(...array_map('intval', $matches));
        }
    } catch (PDOException $exception) {
        Response::error('Database error: ' . $exception->getMessage(), 500);
    } catch (Throwable $exception) {
        Response::error('Server error: ' . $exception->getMessage(), 500);
    }

    exit;
}

Response::error('Route not found.', 404);

