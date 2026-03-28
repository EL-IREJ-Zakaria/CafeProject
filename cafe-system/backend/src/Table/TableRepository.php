<?php

declare(strict_types=1);

namespace CafeSystem\Table;

use PDO;

final class TableRepository
{
    public function __construct(private readonly PDO $connection)
    {
    }

    public function existsByTableNumber(int $tableNumber): bool
    {
        $statement = $this->connection->prepare(
            'SELECT table_number FROM `tables` WHERE table_number = :table_number LIMIT 1'
        );
        $statement->execute(['table_number' => $tableNumber]);

        return $statement->fetchColumn() !== false;
    }
}
