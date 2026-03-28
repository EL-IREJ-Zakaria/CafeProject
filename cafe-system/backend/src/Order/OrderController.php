<?php

declare(strict_types=1);

namespace CafeSystem\Order;

use CafeSystem\Core\Request;

final class OrderController
{
    public function __construct(private readonly OrderService $service)
    {
    }

    public function index(Request $request): array
    {
        return [
            'success' => true,
            'message' => 'Orders fetched successfully.',
            'data' => $this->service->getOrders([
                'status' => $request->query('status'),
                'table_number' => $request->query('table_number'),
            ]),
        ];
    }

    public function store(Request $request): array
    {
        return [
            'success' => true,
            'message' => 'Order created successfully.',
            'data' => $this->service->createOrder($request->body()),
        ];
    }

    public function updateStatus(Request $request, int $id): array
    {
        return [
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => $this->service->updateStatus($id, $request->body()),
        ];
    }
}
