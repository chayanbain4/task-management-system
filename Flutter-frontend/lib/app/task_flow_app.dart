import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/theme/app_theme.dart';
import '../features/auth/presentation/controllers/auth_controller.dart';
import '../features/auth/presentation/screens/auth_screen.dart';
import '../features/auth/presentation/screens/splash_screen.dart';
import '../features/tasks/presentation/screens/tasks_screen.dart';

class TaskFlowApp extends ConsumerWidget {
  const TaskFlowApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return MaterialApp(
      title: 'TaskFlow',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: AnimatedSwitcher(
        duration: const Duration(milliseconds: 350),
        child: switch (authState.status) {
          AuthStatus.loading => const SplashScreen(),
          AuthStatus.unauthenticated => const AuthScreen(),
          AuthStatus.authenticated => const TasksScreen(),
        },
      ),
    );
  }
}
