class OrderItem {
  const OrderItem({
    required this.name,
    required this.price,
    required this.quantity,
  });

  final String name;
  final double price;
  final int quantity;

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      name: json['name'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
    );
  }
}

class Order {
  const Order({
    required this.id,
    required this.tableNumber,
    required this.items,
    required this.totalPrice,
    required this.status,
    required this.createdAt,
  });

  final int id;
  final int tableNumber;
  final List<OrderItem> items;
  final double totalPrice;
  final String status;
  final DateTime? createdAt;

  factory Order.fromJson(Map<String, dynamic> json) {
    final produit = (json['produit'] ?? '').toString();
    final prixValue = json['prix'];
    final price = prixValue is num
        ? prixValue.toDouble()
        : double.tryParse(prixValue?.toString() ?? '0') ?? 0;

    return Order(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      tableNumber: int.tryParse(json['table_number']?.toString() ?? '0') ?? 0,
      items: [
        OrderItem(name: produit, price: price, quantity: 1),
      ],
      totalPrice: price,
      status: _normalizeStatus((json['statut'] ?? json['status'] ?? '').toString()),
      createdAt: DateTime.tryParse((json['date_commande'] ?? json['created_at'] ?? '').toString()),
    );
  }

  static String _normalizeStatus(String value) {
    switch (value) {
      case 'en_attente':
        return 'pending';
      case 'en_preparation':
        return 'preparing';
      case 'servie':
        return 'served';
      default:
        return value.isEmpty ? 'pending' : value;
    }
  }
}
