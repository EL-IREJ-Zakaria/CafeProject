<?php

require_once __DIR__ . '/connexion.php';

// Accept only PUT requests.
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use PUT.',
    ]);
    exit;
}

// Read JSON body sent by the client.
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON body.',
    ]);
    exit;
}

$id = isset($input['id']) ? (int) $input['id'] : 0;
$statut = isset($input['statut']) ? trim((string) $input['statut']) : '';

if ($id <= 0 || $statut === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'id and statut are required.',
    ]);
    exit;
}

// Update the order status.
$sql = 'UPDATE commandes SET statut = ? WHERE id = ?';
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare update query.',
        'error' => $conn->error,
    ]);
    exit;
}

$stmt->bind_param('si', $statut, $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode([
        'success' => true,
        'message' => 'Commande status updated successfully.',
        'data' => [
            'id' => $id,
            'statut' => $statut,
        ],
    ]);
} else {
    $check = $conn->prepare('SELECT id FROM commandes WHERE id = ?');
    $check->bind_param('i', $id);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Commande not found.',
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'No change detected. Commande status is already up to date.',
            'data' => [
                'id' => $id,
                'statut' => $statut,
            ],
        ]);
    }

    $check->close();
}

$stmt->close();
$conn->close();
