<?php

declare(strict_types=1);

namespace CafeSystem\Menu;

use CafeSystem\Core\Request;

final class MenuController
{
    public function __construct(private readonly MenuService $service)
    {
    }

    public function index(Request $request): array
    {
        $includeUnavailable = filter_var(
            $request->query('include_unavailable', false),
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE
        ) ?? false;

        return [
            'success' => true,
            'message' => 'Menu fetched successfully.',
            'data' => $this->service->getMenu((string) $request->query('category', ''), $includeUnavailable),
        ];
    }

    public function store(Request $request): array
    {
        return [
            'success' => true,
            'message' => 'Menu item created successfully.',
            'data' => $this->service->createMenuItem($request->body()),
        ];
    }

    public function destroy(Request $request, int $id): array
    {
        $this->service->deleteMenuItem($id);

        return [
            'success' => true,
            'message' => 'Menu item deleted successfully.',
        ];
    }

    public function update(Request $request, int $id): array
    {
        return [
            'success' => true,
            'message' => 'Menu item updated successfully.',
            'data' => $this->service->updateMenuItem($id, $request->body()),
        ];
    }
}
