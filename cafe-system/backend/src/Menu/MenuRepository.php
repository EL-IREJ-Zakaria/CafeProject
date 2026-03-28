<?php

declare(strict_types=1);

namespace CafeSystem\Menu;

use PDO;

final class MenuRepository
{
    public function __construct(private readonly PDO $connection)
    {
    }

    public function all(?string $category = null, bool $includeUnavailable = false): array
    {
        $sql = 'SELECT id, name, description, category, price, image, is_available, created_at FROM menu_items';
        $conditions = [];
        $params = [];

        if (!$includeUnavailable) {
            $conditions[] = 'is_available = 1';
        }

        if ($category !== null && $category !== '') {
            $conditions[] = 'category = :category';
            $params['category'] = $category;
        }

        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY FIELD(category, "Coffee", "Cold Drinks", "Sandwiches", "Desserts"), name ASC';
        $statement = $this->connection->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $statement = $this->connection->prepare(
            'SELECT id, name, description, category, price, image, is_available, created_at FROM menu_items WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $item = $statement->fetch();

        return $item === false ? null : $item;
    }

    public function findManyByIds(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $placeholders = implode(', ', array_fill(0, count($ids), '?'));
        $statement = $this->connection->prepare(
            "SELECT id, name, description, category, price, image, is_available, created_at FROM menu_items WHERE id IN ($placeholders)"
        );
        $statement->execute($ids);

        $items = [];
        foreach ($statement->fetchAll() as $row) {
            $items[(int) $row['id']] = $row;
        }

        return $items;
    }

    public function create(array $data): array
    {
        $statement = $this->connection->prepare(
            'INSERT INTO menu_items (name, description, category, price, image, is_available) VALUES (:name, :description, :category, :price, :image, :is_available)'
        );
        $statement->execute([
            'name' => $data['name'],
            'description' => $data['description'],
            'category' => $data['category'],
            'price' => $data['price'],
            'image' => $data['image'],
            'is_available' => $data['is_available'],
        ]);

        return $this->findById((int) $this->connection->lastInsertId()) ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        $statement = $this->connection->prepare(
            'UPDATE menu_items SET name = :name, description = :description, category = :category, price = :price, image = :image, is_available = :is_available WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'name' => $data['name'],
            'description' => $data['description'],
            'category' => $data['category'],
            'price' => $data['price'],
            'image' => $data['image'],
            'is_available' => $data['is_available'],
        ]);

        if ($statement->rowCount() === 0 && $this->findById($id) === null) {
            return null;
        }

        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->connection->prepare('DELETE FROM menu_items WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }
}
