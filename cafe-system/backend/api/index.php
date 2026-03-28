<?php

declare(strict_types=1);

use CafeSystem\Core\Database;
use CafeSystem\Core\JsonResponse;
use CafeSystem\Core\Request;
use CafeSystem\Core\Router;
use CafeSystem\Menu\MenuController;
use CafeSystem\Menu\MenuRepository;
use CafeSystem\Menu\MenuService;
use CafeSystem\Order\OrderController;
use CafeSystem\Order\OrderRepository;
use CafeSystem\Order\OrderService;
use CafeSystem\Table\TableRepository;
use CafeSystem\Shared\Exceptions\HttpException;

$config = require dirname(__DIR__) . DIRECTORY_SEPARATOR . 'bootstrap.php';

$allowedOrigins = $config['app']['allowed_origins'];
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array('*', $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($requestOrigin !== '' && in_array($requestOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
}

header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $database = new Database($config['database']);
    $connection = $database->connection();

    $menuRepository = new MenuRepository($connection);
    $tableRepository = new TableRepository($connection);
    $orderRepository = new OrderRepository($connection);

    $menuController = new MenuController(new MenuService($menuRepository));
    $orderController = new OrderController(new OrderService($orderRepository, $menuRepository, $tableRepository));

    $router = new Router();
    $router->get('/api/health', static fn (): array => [
        'success' => true,
        'message' => 'Cafe API is healthy.',
        'data' => [
            'service' => $config['app']['name'],
            'timestamp' => date(DATE_ATOM),
        ],
    ]);
    $router->get('/api/menu', [$menuController, 'index']);
    $router->post('/api/menu', [$menuController, 'store']);
    $router->put('/api/menu/{id}', [$menuController, 'update']);
    $router->delete('/api/menu/{id}', [$menuController, 'destroy']);
    $router->get('/api/orders', [$orderController, 'index']);
    $router->post('/api/order', [$orderController, 'store']);
    $router->put('/api/order/{id}/status', [$orderController, 'updateStatus']);

    $request = Request::capture();
    $response = $router->dispatch($request);

    JsonResponse::send($response);
} catch (HttpException $exception) {
    JsonResponse::send([
        'success' => false,
        'message' => $exception->getMessage(),
        'errors' => $exception->getErrors(),
    ], $exception->getStatusCode());
} catch (Throwable $throwable) {
    JsonResponse::send([
        'success' => false,
        'message' => 'Unexpected server error.',
    ], 500);
}
