<?php

declare(strict_types=1);

final class AdminUser
{
    public function findByUsername(string $username): ?array
    {
        $statement = Database::connection()->prepare(
            'SELECT id, username, password_hash, full_name FROM admin_users WHERE username = :username LIMIT 1'
        );
        $statement->execute(['username' => $username]);

        $user = $statement->fetch();
        return $user ?: null;
    }
}

