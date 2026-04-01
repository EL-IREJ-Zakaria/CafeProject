import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

void main() {
  testWidgets('renders waiter login screen', (tester) async {
    await tester.pumpWidget(
      CafeWaiterApp(
        apiService: ApiService(baseUrl: 'http://127.0.0.1:8080/api'),
      ),
    );

    expect(find.text('Cafe waiter console'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
  });
}
