<?php

declare(strict_types=1);

namespace CafeSystem\Order;

use PDO;

final class OrderRepository
{
    public function __construct(private readonly PDO $connection)
    {
    }

    public function create(array $payload): array
    {
        $this->connection->beginTransaction();

        try {
            $statement = $this->connection->prepare(
                'INSERT INTO orders (table_number, total_price, status) VALUES (:table_number, :total_price, :status)'
            );
            $statement->execute([
                'table_number' => $payload['table_number'],
                'total_price' => $payload['total_price'],
                'status' => $payload['status'],
            ]);

            $orderId = (int) $this->connection->lastInsertId();
            $itemStatement = $this->connection->prepare(
                'INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (:order_id, :item_name, :quantity, :price)'
            );

            foreach ($payload['items'] as $item) {
                $itemStatement->execute([
                    'order_id' => $orderId,
                    'item_name' => $item['item_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            $this->connection->commit();

            return $this->findById($orderId) ?? [];
        } catch (\Throwable $throwable) {
            if ($this->connection->inTransaction()) {
                $this->connection->rollBack();
            }

            throw $throwable;
        }
    }

    public function findById(int $orderId): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT id, table_number, total_price, status, created_at FROM orders WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $orderId]);
        $order = $statement->fetch();

        if ($order === false) {
            return null;
        }

        $itemsStatement = $this->connection->prepare(
            'SELECT id, order_id, item_name, quantity, price FROM order_items WHERE order_id = :order_id ORDER BY id ASC'
        );
        $itemsStatement->execute(['order_id' => $orderId]);

        $order['id'] = (int) $order['id'];
        $order['table_number'] = (int) $order['table_number'];
        $order['total_price'] = (float) $order['total_price'];
        $order['items'] = array_map(static function (array $item): array {
            $item['id'] = (int) $item['id'];
            $item['order_id'] = (int) $item['order_id'];
            $item['quantity'] = (int) $item['quantity'];
            $item['price'] = (float) $item['price'];
            return $item;
        }, $itemsStatement->fetchAll());

        return $order;
    }

    public function getAll(array $filters = []): array
    {
        $conditions = [];
        $params = [];

        if (isset($filters['status']) && $filters['status'] !== '') {
            $conditions[] = 'status = :status';
            $params['status'] = $filters['status'];
        }

        if (isset($filters['table_number']) && $filters['table_number'] !== null) {
            $conditions[] = 'table_number = :table_number';
            $params['table_number'] = $filters['table_number'];
        }

        $sql = 'SELECT id, table_number, total_price, status, created_at FROM orders';
        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $sql .= ' ORDER BY created_at DESC, id DESC';

        $statement = $this->connection->prepare($sql);
        $statement->execute($params);
        $orders = $statement->fetchAll();

        if ($orders === []) {
            return [];
        }

        $orderIds = array_map(static fn (array $order): int => (int) $order['id'], $orders);
        $placeholders = implode(', ', array_fill(0, count($orderIds), '?'));
        $itemsStatement = $this->connection->prepare(
            "SELECT id, order_id, item_name, quantity, price FROM order_items WHERE order_id IN ($placeholders) ORDER BY id ASC"
        );
        $itemsStatement->execute($orderIds);

        $itemsByOrder = [];
        foreach ($itemsStatement->fetchAll() as $item) {
            $item['id'] = (int) $item['id'];
            $item['order_id'] = (int) $item['order_id'];
            $item['quantity'] = (int) $item['quantity'];
            $item['price'] = (float) $item['price'];
            $itemsByOrder[$item['order_id']][] = $item;
        }

        return array_map(static function (array $order) use ($itemsByOrder): array {
            $orderId = (int) $order['id'];
            return [
                'id' => $orderId,
                'table_number' => (int) $order['table_number'],
                'total_price' => (float) $order['total_price'],
                'status' => $order['status'],
                'created_at' => $order['created_at'],
                'items' => $itemsByOrder[$orderId] ?? [],
            ];
        }, $orders);
    }

    public function updateStatus(int $orderId, string $status): ?array
    {
        $statement = $this->connection->prepare(
            'UPDATE orders SET status = :status WHERE id = :id'
        );
        $statement->execute([
            'status' => $status,
            'id' => $orderId,
        ]);

        if ($statement->rowCount() === 0 && $this->findById($orderId) === null) {
            return null;
        }

        return $this->findById($orderId);
    }
}
