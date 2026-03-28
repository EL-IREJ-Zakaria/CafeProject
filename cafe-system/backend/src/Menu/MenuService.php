<?php

declare(strict_types=1);

namespace CafeSystem\Menu;

use CafeSystem\Shared\Exceptions\HttpException;
use CafeSystem\Shared\Exceptions\ValidationException;

final class MenuService
{
    public const CATEGORIES = ['Coffee', 'Cold Drinks', 'Sandwiches', 'Desserts'];

    public function __construct(private readonly MenuRepository $repository)
    {
    }

    public function getMenu(?string $category = null, bool $includeUnavailable = false): array
    {
        if ($category !== null && $category !== '' && !in_array($category, self::CATEGORIES, true)) {
            throw new ValidationException('Unsupported category filter.');
        }

        $items = $this->repository->all($category, $includeUnavailable);

        $groupedItems = [];
        foreach (self::CATEGORIES as $supportedCategory) {
            $groupedItems[$supportedCategory] = [];
        }

        foreach ($items as $item) {
            $item['price'] = (float) $item['price'];
            $item['is_available'] = (bool) $item['is_available'];
            $groupedItems[$item['category']][] = $item;
        }

        return [
            'categories' => self::CATEGORIES,
            'items' => $groupedItems,
            'flat_items' => array_values(array_merge(...array_values($groupedItems))),
        ];
    }

    public function createMenuItem(array $payload): array
    {
        $normalized = $this->normalizePayload($payload, [
            'name' => '',
            'description' => '',
            'category' => '',
            'price' => null,
            'image' => '',
            'is_available' => true,
        ]);

        return $this->repository->create([
            'name' => $normalized['name'],
            'description' => $normalized['description'],
            'category' => $normalized['category'],
            'price' => $normalized['price'],
            'image' => $normalized['image'],
            'is_available' => $normalized['is_available'],
        ]);
    }

    public function updateMenuItem(int $id, array $payload): array
    {
        $existingItem = $this->repository->findById($id);
        if ($existingItem === null) {
            throw new HttpException(404, 'Menu item not found.');
        }

        $normalized = $this->normalizePayload($payload, [
            'name' => $existingItem['name'],
            'description' => $existingItem['description'],
            'category' => $existingItem['category'],
            'price' => $existingItem['price'],
            'image' => $existingItem['image'],
            'is_available' => $existingItem['is_available'],
        ]);

        $updatedItem = $this->repository->update($id, $normalized);

        if ($updatedItem === null) {
            throw new HttpException(404, 'Menu item not found.');
        }

        $updatedItem['price'] = (float) $updatedItem['price'];
        $updatedItem['is_available'] = (bool) $updatedItem['is_available'];

        return $updatedItem;
    }

    private function normalizePayload(array $payload, array $defaults): array
    {
        $name = trim((string) ($payload['name'] ?? $defaults['name']));
        $description = trim((string) ($payload['description'] ?? $defaults['description']));
        $category = trim((string) ($payload['category'] ?? $defaults['category']));
        $image = trim((string) ($payload['image'] ?? $defaults['image']));
        $price = $payload['price'] ?? $defaults['price'];
        $isAvailable = filter_var(
            $payload['is_available'] ?? $defaults['is_available'],
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        );

        $errors = [];

        if ($name === '') {
            $errors['name'] = 'Item name is required.';
        }

        if (!in_array($category, self::CATEGORIES, true)) {
            $errors['category'] = 'Category must be one of the supported menu categories.';
        }

        if (!is_numeric($price) || (float) $price <= 0) {
            $errors['price'] = 'Price must be a positive number.';
        }

        if ($image === '') {
            $errors['image'] = 'Image path or URL is required.';
        }

        if ($isAvailable === null) {
            $errors['is_available'] = 'Availability must be true or false.';
        }

        if ($errors !== []) {
            throw new ValidationException('Please correct the menu item payload.', $errors);
        }

        return [
            'name' => $name,
            'description' => $description,
            'category' => $category,
            'price' => round((float) $price, 2),
            'image' => $image,
            'is_available' => $isAvailable,
        ];
    }

    public function deleteMenuItem(int $id): void
    {
        if (!$this->repository->delete($id)) {
            throw new HttpException(404, 'Menu item not found.');
        }
    }
}
