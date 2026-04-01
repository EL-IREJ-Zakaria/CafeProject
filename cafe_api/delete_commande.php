<?php

require_once __DIR__ . '/connexion.php';

// Accept only DELETE requests.
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use DELETE.',
    ]);
    exit;
}

// Read JSON body. Support query string id as a fallback.
$input = json_decode(file_get_contents('php://input'), true);
$id = 0;

if (is_array($input) && isset($input['id'])) {
    $id = (int) $input['id'];
} elseif (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
}

if ($id <= 0) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'A valid id is required.',
    ]);
    exit;
}

// Delete the selected order.
$sql = 'DELETE FROM commandes WHERE id = ?';
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare delete query.',
        'error' => $conn->error,
    ]);
    exit;
}

$stmt->bind_param('i', $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        'success' => true,
        'message' => 'Commande deleted successfully.',
        'data' => [
            'id' => $id,
        ],
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Commande not found.',
    ]);
}

$stmt->close();
$conn->close();
