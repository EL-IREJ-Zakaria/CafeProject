<?php

declare(strict_types=1);

namespace CafeSystem\Shared\Exceptions;

use RuntimeException;

class HttpException extends RuntimeException
{
    public function __construct(
        private readonly int $statusCode,
        string $message,
        private readonly array $errors = []
    ) {
        parent::__construct($message, $statusCode);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
