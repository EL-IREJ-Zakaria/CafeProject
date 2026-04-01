import 'dart:convert';
import 'dart:io';

import '../models/order.dart';

class ApiService {
  ApiService({String? baseUrl})
      : baseUrl = baseUrl ??
            const String.fromEnvironment(
              'API_BASE_URL',
              defaultValue: 'http://10.0.2.2/CafeProject/cafe_api',
            );

  final String baseUrl;
  final HttpClient _client = HttpClient();
  String? _adminName;

  bool get isAuthenticated => _adminName != null && _adminName!.isNotEmpty;

  Future<String> login({
    required String username,
    required String password,
  }) async {
    final response = await _send(
      'POST',
      '/login.php',
      body: {
        'username': username,
        'password': password,
      },
    );

    _adminName = response['data']['admin']['full_name'] as String? ?? 'Cafe Admin';
    return _adminName!;
  }

  Future<List<Order>> fetchOrders({bool pendingOnly = true}) async {
    if (!isAuthenticated) {
      throw const HttpException('Authentication required.');
    }

    final suffix = pendingOnly ? '' : '?all=1';
    final response = await _send('GET', '/get_commandes.php$suffix');

    final items = response['data'] as List<dynamic>? ?? const [];
    return items
        .map((item) => Order.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Order> updateOrderStatus({
    required int orderId,
    required String status,
  }) async {
    if (!isAuthenticated) {
      throw const HttpException('Authentication required.');
    }

    final apiStatus = switch (status) {
      'pending' => 'en_attente',
      'preparing' => 'en_preparation',
      'served' => 'servie',
      _ => status,
    };

    await _send(
      'PUT',
      '/update_commande.php',
      body: {
        'id': orderId,
        'statut': apiStatus,
      },
    );

    final refreshed = await fetchOrders(pendingOnly: false);
    return refreshed.firstWhere((order) => order.id == orderId);
  }

  void logout() {
    _adminName = null;
  }

  Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final request = await _client.openUrl(method, Uri.parse('$baseUrl$path'));

    request.headers.contentType = ContentType.json;
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');

    if (body != null) {
      request.write(jsonEncode(body));
    }

    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();
    final decoded = jsonDecode(responseBody) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final errors = decoded['errors'];
      if (errors is Map && errors.isNotEmpty) {
        throw HttpException(errors.values.join(' '));
      }
      throw HttpException(decoded['message'] as String? ?? 'Request failed.');
    }

    return decoded;
  }
}
