import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/api_exception.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../../tasks/presentation/controllers/tasks_controller.dart';
import '../../data/auth_repository.dart';
import '../../models/user_model.dart';

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(ref);
});

enum AuthStatus { loading, unauthenticated, authenticated }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final bool isSubmitting;
  final String? errorMessage;

  const AuthState({
    required this.status,
    this.user,
    this.isSubmitting = false,
    this.errorMessage,
  });

  const AuthState.loading()
      : status = AuthStatus.loading,
        user = null,
        isSubmitting = false,
        errorMessage = null;

  const AuthState.unauthenticated({
    this.errorMessage,
    this.isSubmitting = false,
  })  : status = AuthStatus.unauthenticated,
        user = null;

  const AuthState.authenticated(
    this.user, {
    this.isSubmitting = false,
  })  : status = AuthStatus.authenticated,
        errorMessage = null;
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this.ref) : super(const AuthState.loading()) {
    bootstrap();
  }

  final Ref ref;

  SecureStorageService get _storage => ref.read(secureStorageProvider);
  AuthRepository get _repository => ref.read(authRepositoryProvider);

  Future<void> bootstrap() async {
    final savedUser = await _storage.readUser();
    final accessToken = await _storage.readAccessToken();
    final refreshToken = await _storage.readRefreshToken();

    if (savedUser != null && accessToken != null && accessToken.isNotEmpty) {
      ref.invalidate(tasksControllerProvider);
      state = AuthState.authenticated(savedUser);
      return;
    }

    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        final result = await _repository.refreshSession();
        ref.invalidate(tasksControllerProvider);
        state = AuthState.authenticated(result.user);
        return;
      } catch (_) {
        await _storage.clearSession();
      }
    }

    ref.invalidate(tasksControllerProvider);
    state = const AuthState.unauthenticated();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = AuthState(
      status: state.status,
      user: state.user,
      isSubmitting: true,
      errorMessage: null,
    );

    try {
      final result = await _repository.login(
        email: email,
        password: password,
      );
      ref.invalidate(tasksControllerProvider);
      state = AuthState.authenticated(result.user);
    } on ApiException catch (e) {
      state = AuthState.unauthenticated(errorMessage: e.message);
      rethrow;
    } catch (_) {
      state = const AuthState.unauthenticated(errorMessage: 'Unable to login');
      rethrow;
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    state = AuthState(
      status: state.status,
      user: state.user,
      isSubmitting: true,
      errorMessage: null,
    );

    try {
      final result = await _repository.register(
        name: name,
        email: email,
        password: password,
      );
      ref.invalidate(tasksControllerProvider);
      state = AuthState.authenticated(result.user);
    } on ApiException catch (e) {
      state = AuthState.unauthenticated(errorMessage: e.message);
      rethrow;
    } catch (_) {
      state =
          const AuthState.unauthenticated(errorMessage: 'Unable to register');
      rethrow;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    ref.invalidate(tasksControllerProvider);
    state = const AuthState.unauthenticated();
  }

  Future<void> forceLogout() async {
    await _storage.clearSession();
    ref.invalidate(tasksControllerProvider);
    state = const AuthState.unauthenticated();
  }
}