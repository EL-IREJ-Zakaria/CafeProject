<?php

declare(strict_types=1);

$orderId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$_SERVER['REQUEST_URI'] = '/api/order/' . $orderId . '/status';
$_SERVER['REQUEST_METHOD'] = 'PUT';

require __DIR__ . DIRECTORY_SEPARATOR . 'index.php';
