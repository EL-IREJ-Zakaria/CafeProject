<?php

declare(strict_types=1);

final class Order
{
    public function create(array $data): array
    {
        $statement = Database::connection()->prepare(
            'INSERT INTO orders (table_number, items, total_price, status) VALUES (:table_number, :items, :total_price, :status)'
        );

        $statement->execute([
            'table_number' => $data['table_number'],
            'items' => json_encode($data['items'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'total_price' => $data['total_price'],
            'status' => $data['status'],
        ]);

        return $this->findById((int) Database::connection()->lastInsertId()) ?? [];
    }

    public function findAll(?string $status = null): array
    {
        $sql = 'SELECT id, table_number, items, total_price, status, created_at FROM orders';
        $params = [];

        if ($status !== null) {
            $sql .= ' WHERE status = :status';
            $params['status'] = $status;
        }

        $sql .= ' ORDER BY created_at DESC, id DESC';

        $statement = Database::connection()->prepare($sql);
        $statement->execute($params);

        $rows = $statement->fetchAll() ?: [];
        return array_map([$this, 'hydrateOrder'], $rows);
    }

    public function findById(int $id): ?array
    {
        $statement = Database::connection()->prepare(
            'SELECT id, table_number, items, total_price, status, created_at FROM orders WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);

        $row = $statement->fetch();
        return $row ? $this->hydrateOrder($row) : null;
    }

    public function updateStatus(int $id, string $status): ?array
    {
        $statement = Database::connection()->prepare(
            'UPDATE orders SET status = :status WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'status' => $status,
        ]);

        return $this->findById($id);
    }

    private function hydrateOrder(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'table_number' => (int) $row['table_number'],
            'items' => json_decode((string) $row['items'], true, 512, JSON_THROW_ON_ERROR),
            'total_price' => (float) $row['total_price'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
        ];
    }
}

