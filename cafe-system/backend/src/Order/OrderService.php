<?php

declare(strict_types=1);

namespace CafeSystem\Order;

use Throwable;
use CafeSystem\Menu\MenuRepository;
use CafeSystem\Table\TableRepository;
use CafeSystem\Shared\Exceptions\HttpException;
use CafeSystem\Shared\Exceptions\ValidationException;

final class OrderService
{
    public const STATUSES = ['pending', 'preparing', 'served', 'cancelled'];

    public function __construct(
        private readonly OrderRepository $repository,
        private readonly MenuRepository $menuRepository,
        private readonly TableRepository $tableRepository
    ) {
    }

    public function getOrders(array $filters = []): array
    {
        $status = isset($filters['status']) ? trim((string) $filters['status']) : null;
        $tableNumber = isset($filters['table_number']) ? (int) $filters['table_number'] : null;

        if ($status !== null && $status !== '' && !in_array($status, self::STATUSES, true)) {
            throw new ValidationException('Unsupported order status filter.');
        }

        if ($tableNumber !== null && $tableNumber <= 0) {
            throw new ValidationException('Table number filter must be a positive integer.');
        }

        return $this->repository->getAll([
            'status' => $status,
            'table_number' => $tableNumber,
        ]);
    }

    public function createOrder(array $payload): array
    {
        $tableNumber = (int) ($payload['table_number'] ?? 0);
        $items = $payload['items'] ?? [];
        $errors = [];

        if ($tableNumber <= 0) {
            $errors['table_number'] = 'Table number must be a positive integer.';
        } elseif (!$this->tableRepository->existsByTableNumber($tableNumber)) {
            $errors['table_number'] = 'Selected table does not exist.';
        }

        if (!is_array($items) || $items === []) {
            $errors['items'] = 'At least one order item is required.';
        }

        if ($errors !== []) {
            throw new ValidationException('Please correct the order payload.', $errors);
        }

        $normalizedItems = $this->normalizeItems($items);
        $total = array_reduce(
            $normalizedItems,
            static fn (float $carry, array $item): float => $carry + ($item['price'] * $item['quantity']),
            0.0
        );

        $providedTotal = isset($payload['total']) && is_numeric($payload['total'])
            ? round((float) $payload['total'], 2)
            : null;
        $computedTotal = round($total, 2);

        if ($providedTotal !== null && abs($providedTotal - $computedTotal) > 0.01) {
            throw new ValidationException('Submitted total does not match the server calculation.', [
                'total' => 'Please refresh the cart and try again.',
            ]);
        }

        try {
            return $this->repository->create([
                'table_number' => $tableNumber,
                'total_price' => $computedTotal,
                'status' => 'pending',
                'items' => $normalizedItems,
            ]);
        } catch (Throwable $throwable) {
            throw new HttpException(500, 'Unable to create the order at the moment.');
        }
    }

    public function updateStatus(int $orderId, array $payload): array
    {
        $status = trim((string) ($payload['status'] ?? ''));

        if (!in_array($status, self::STATUSES, true)) {
            throw new ValidationException('Unsupported order status.', [
                'status' => 'Status must be pending, preparing, served, or cancelled.',
            ]);
        }

        $order = $this->repository->updateStatus($orderId, $status);
        if ($order === null) {
            throw new HttpException(404, 'Order not found.');
        }

        return $order;
    }

    private function normalizeItems(array $items): array
    {
        $errors = [];
        $requestedIds = [];

        foreach ($items as $index => $item) {
            if (!is_array($item)) {
                $errors["items.$index"] = 'Each order item must be an object.';
                continue;
            }

            if (isset($item['id']) && is_numeric($item['id'])) {
                $requestedIds[] = (int) $item['id'];
            }
        }

        $menuItemsById = $this->menuRepository->findManyByIds(array_values(array_unique($requestedIds)));
        $normalizedItems = [];

        foreach ($items as $index => $item) {
            if (!is_array($item)) {
                continue;
            }

            $quantity = (int) ($item['quantity'] ?? 0);
            if ($quantity <= 0) {
                $errors["items.$index.quantity"] = 'Quantity must be a positive integer.';
                continue;
            }

            $menuItemId = isset($item['id']) && is_numeric($item['id']) ? (int) $item['id'] : null;
            if ($menuItemId !== null) {
                $menuItem = $menuItemsById[$menuItemId] ?? null;
                if ($menuItem === null) {
                    $errors["items.$index.id"] = 'Menu item not found.';
                    continue;
                }

                $normalizedItems[] = [
                    'item_name' => $menuItem['name'],
                    'quantity' => $quantity,
                    'price' => round((float) $menuItem['price'], 2),
                ];

                continue;
            }

            $name = trim((string) ($item['name'] ?? ''));
            $price = $item['price'] ?? null;

            if ($name === '') {
                $errors["items.$index.name"] = 'Item name is required when no menu item id is provided.';
            }

            if (!is_numeric($price) || (float) $price <= 0) {
                $errors["items.$index.price"] = 'Price must be a positive number.';
            }

            if (isset($errors["items.$index.name"]) || isset($errors["items.$index.price"])) {
                continue;
            }

            $normalizedItems[] = [
                'item_name' => $name,
                'quantity' => $quantity,
                'price' => round((float) $price, 2),
            ];
        }

        if ($errors !== []) {
            throw new ValidationException('Please correct the order items.', $errors);
        }

        return $normalizedItems;
    }
}
