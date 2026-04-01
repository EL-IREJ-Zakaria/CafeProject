<?php

declare(strict_types=1);

return [
    'name' => 'Cafe Ordering API',
    'env' => $_ENV['APP_ENV'] ?? 'local',
    'url' => $_ENV['APP_URL'] ?? 'http://127.0.0.1:8080',
    'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'change-this-secret-in-production',
    'jwt_ttl' => (int) ($_ENV['JWT_TTL'] ?? 43200),
    'cors_allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost')
    ))),
];

