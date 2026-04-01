import 'package:flutter/material.dart';

import '../screens/login_screen.dart';
import '../services/api_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(CafeWaiterApp(apiService: ApiService()));
}

class CafeWaiterApp extends StatelessWidget {
  const CafeWaiterApp({super.key, required this.apiService});

  final ApiService apiService;

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF6F4E37),
      brightness: Brightness.light,
    );

    return MaterialApp(
      title: 'Cafe Waiter',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: colorScheme,
        scaffoldBackgroundColor: const Color(0xFFF8F3EE),
        useMaterial3: true,
        cardTheme: const CardThemeData(
          margin: EdgeInsets.zero,
          color: Colors.white,
          surfaceTintColor: Colors.white,
        ),
      ),
      home: LoginScreen(apiService: apiService),
    );
  }
}

