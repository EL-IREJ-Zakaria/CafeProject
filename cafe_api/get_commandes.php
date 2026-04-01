<?php

require_once __DIR__ . '/connexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use GET.',
    ]);
    exit;
}

$showAll = isset($_GET['all']) && $_GET['all'] === '1';

$sql = 'SELECT id, table_number, produit, prix, statut, date_commande FROM commandes';
if (!$showAll) {
    $sql .= " WHERE statut = 'en_attente'";
}
$sql .= ' ORDER BY date_commande DESC, id DESC';

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch commandes.',
        'error' => $conn->error,
    ]);
    exit;
}

$commandes = [];
while ($row = $result->fetch_assoc()) {
    $commandes[] = $row;
}

echo json_encode([
    'success' => true,
    'message' => 'Commandes fetched successfully.',
    'count' => count($commandes),
    'data' => $commandes,
]);

$result->free();
$conn->close();
