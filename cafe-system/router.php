<?php

declare(strict_types=1);

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$projectRoot = __DIR__;
$staticFile = realpath($projectRoot . $requestPath);

if ($requestPath !== '/' && $staticFile !== false && str_starts_with($staticFile, $projectRoot) && is_file($staticFile)) {
    return false;
}

if (str_starts_with($requestPath, '/api')) {
    require $projectRoot . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'index.php';
    return true;
}

if (preg_match('#^/table/\d+/?$#', $requestPath) === 1) {
    require $projectRoot . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'index.html';
    return true;
}

if ($requestPath === '/') {
    require $projectRoot . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'index.html';
    return true;
}

$frontendTarget = realpath($projectRoot . DIRECTORY_SEPARATOR . ltrim($requestPath, '/'));
if ($frontendTarget !== false && str_starts_with($frontendTarget, $projectRoot) && is_file($frontendTarget)) {
    return false;
}

http_response_code(404);
echo 'Not Found';
return true;
