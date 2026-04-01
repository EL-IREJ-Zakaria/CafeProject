<?php

require_once __DIR__ . '/connexion.php';

// Accept only POST requests.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.',
    ]);
    exit;
}

// Read JSON body or fallback to form-data.
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$tableNumber = isset($input['table_number']) ? (int) $input['table_number'] : 0;
$produit = isset($input['produit']) ? trim((string) $input['produit']) : '';
$prix = isset($input['prix']) ? (float) $input['prix'] : -1;

// Validate required fields.
$errors = [];
if ($tableNumber <= 0) {
    $errors['table_number'] = 'table_number is required and must be greater than 0.';
}
if ($produit === '') {
    $errors['produit'] = 'produit is required.';
}
if ($prix < 0) {
    $errors['prix'] = 'prix is required and must be a valid positive number.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $errors,
    ]);
    exit;
}

// Insert a new order with the default status from the table.
$sql = 'INSERT INTO commandes (table_number, produit, prix) VALUES (?, ?, ?)';
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare insert query.',
        'error' => $conn->error,
    ]);
    exit;
}

$stmt->bind_param('isd', $tableNumber, $produit, $prix);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Commande added successfully.',
        'data' => [
            'id' => $stmt->insert_id,
            'table_number' => $tableNumber,
            'produit' => $produit,
            'prix' => number_format($prix, 2, '.', ''),
            'statut' => 'en_attente',
        ],
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add commande.',
        'error' => $stmt->error,
    ]);
}

$stmt->close();
$conn->close();
