<?php

declare(strict_types=1);

namespace CafeSystem\Shared\Exceptions;

final class ValidationException extends HttpException
{
    public function __construct(string $message, array $errors = [])
    {
        parent::__construct(422, $message, $errors);
    }
}
