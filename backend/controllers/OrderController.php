<?php

declare(strict_types=1);

final class OrderController
{
    private array $allowedStatuses = ['pending', 'preparing', 'served'];

    public function create(): void
    {
        $payload = Request::input();
        $validation = $this->validateOrderPayload($payload);

        if ($validation['errors'] !== []) {
            Response::error('Order validation failed.', 422, $validation['errors']);
        }

        $order = (new Order())->create([
            'table_number' => $validation['table_number'],
            'items' => $validation['items'],
            'total_price' => $validation['total_price'],
            'status' => 'pending',
        ]);

        Response::success($order, 'Order created successfully.', 201);
    }

    public function index(): void
    {
        AuthMiddleware::authenticate();
        Response::success([
            'orders' => (new Order())->findAll(),
        ], 'Orders fetched successfully.');
    }

    public function pending(): void
    {
        AuthMiddleware::authenticate();
        Response::success([
            'orders' => (new Order())->findAll('pending'),
        ], 'Pending orders fetched successfully.');
    }

    public function updateStatus(int $id): void
    {
        AuthMiddleware::authenticate();
        $payload = Request::input();
        $nextStatus = strtolower((string) ($payload['status'] ?? ''));

        if (!in_array($nextStatus, $this->allowedStatuses, true)) {
            Response::error('Status must be pending, preparing, or served.', 422);
        }

        $orderModel = new Order();
        $currentOrder = $orderModel->findById($id);
        if ($currentOrder === null) {
            Response::error('Order not found.', 404);
        }

        $allowedTransitions = [
            'pending' => ['pending', 'preparing'],
            'preparing' => ['preparing', 'served'],
            'served' => ['served'],
        ];

        if (!in_array($nextStatus, $allowedTransitions[$currentOrder['status']] ?? [], true)) {
            Response::error(
                sprintf('Invalid status transition from %s to %s.', $currentOrder['status'], $nextStatus),
                422
            );
        }

        $updated = $orderModel->updateStatus($id, $nextStatus);
        Response::success($updated ?? [], 'Order status updated successfully.');
    }

    private function validateOrderPayload(array $payload): array
    {
        $errors = [];
        $tableNumber = filter_var($payload['table_number'] ?? null, FILTER_VALIDATE_INT);
        if ($tableNumber === false || $tableNumber < 1) {
            $errors['table_number'] = 'Table number must be a positive integer.';
        }

        $items = $payload['items'] ?? null;
        if (!is_array($items) || $items === []) {
            $errors['items'] = 'At least one order item is required.';
        }

        $normalizedItems = [];
        $calculatedTotal = 0.0;

        if (is_array($items)) {
            foreach ($items as $index => $item) {
                if (!is_array($item)) {
                    $errors["items.$index"] = 'Each item must be an object.';
                    continue;
                }

                $name = trim((string) ($item['name'] ?? ''));
                $price = filter_var($item['price'] ?? null, FILTER_VALIDATE_FLOAT);
                $quantity = filter_var($item['quantity'] ?? 1, FILTER_VALIDATE_INT);

                if ($name === '') {
                    $errors["items.$index.name"] = 'Item name is required.';
                }

                if ($price === false || $price < 0) {
                    $errors["items.$index.price"] = 'Item price must be a positive number.';
                }

                if ($quantity === false || $quantity < 1) {
                    $errors["items.$index.quantity"] = 'Item quantity must be at least 1.';
                }

                if ($name !== '' && $price !== false && $price >= 0 && $quantity !== false && $quantity > 0) {
                    $lineTotal = round((float) $price * (int) $quantity, 2);
                    $calculatedTotal += $lineTotal;
                    $normalizedItems[] = [
                        'name' => $name,
                        'price' => round((float) $price, 2),
                        'quantity' => (int) $quantity,
                    ];
                }
            }
        }

        $totalPrice = filter_var($payload['total_price'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($totalPrice === false || $totalPrice < 0) {
            $errors['total_price'] = 'Total price must be a positive number.';
        } elseif (round((float) $totalPrice, 2) !== round($calculatedTotal, 2)) {
            $errors['total_price'] = 'Total price does not match the sum of the selected items.';
        }

        return [
            'errors' => $errors,
            'table_number' => (int) $tableNumber,
            'items' => $normalizedItems,
            'total_price' => round((float) $calculatedTotal, 2),
        ];
    }
}

