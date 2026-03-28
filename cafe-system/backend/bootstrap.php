<?php

declare(strict_types=1);

define('BASE_PATH', __DIR__);

if (!function_exists('loadEnvironment')) {
    function loadEnvironment(string $filePath): void
    {
        if (!is_file($filePath)) {
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
                continue;
            }

            [$name, $value] = explode('=', $trimmed, 2);
            $name = trim($name);
            $value = trim($value);

            if ($value !== '' && (
                (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, '\'') && str_ends_with($value, '\''))
            )) {
                $value = substr($value, 1, -1);
            }

            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed
    {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

        if ($value === false || $value === null || $value === '') {
            return $default;
        }

        return $value;
    }
}

loadEnvironment(BASE_PATH . DIRECTORY_SEPARATOR . '.env');

$appConfig = require BASE_PATH . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'app.php';
$databaseConfig = require BASE_PATH . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'database.php';

date_default_timezone_set((string) $appConfig['timezone']);

spl_autoload_register(static function (string $class): void {
    $prefix = 'CafeSystem\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $filePath = BASE_PATH . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';

    if (is_file($filePath)) {
        require $filePath;
    }
});

return [
    'app' => $appConfig,
    'database' => $databaseConfig,
    
];
