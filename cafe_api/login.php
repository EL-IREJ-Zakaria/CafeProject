<?php

require_once __DIR__ . '/connexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.',
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$email = trim((string)($input['username'] ?? $input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required.',
    ]);
    exit;
}

$stmt = $conn->prepare('SELECT id, nom, email, mot_de_passe, role FROM admin_users WHERE email = ? LIMIT 1');
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare login query.',
        'error' => $conn->error,
    ]);
    exit;
}

$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['mot_de_passe'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid credentials.',
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Login successful.',
    'data' => [
        'admin' => [
            'id' => (int)$user['id'],
            'full_name' => $user['nom'],
            'email' => $user['email'],
            'role' => $user['role'],
        ]
    ],
]);

$stmt->close();
$conn->close();
