<?php

// Return JSON for every response.
header('Content-Type: application/json; charset=utf-8');

// Database configuration.
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'cafe_db';
$port = 3306;

// Create MySQLi connection.
$conn = new mysqli($host, $user, $password, $database, $port);

// Stop immediately if the database connection fails.
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed.',
        'error' => $conn->connect_error,
    ]);
    exit;
}

// Use UTF-8 for safe text handling.
$conn->set_charset('utf8mb4');
