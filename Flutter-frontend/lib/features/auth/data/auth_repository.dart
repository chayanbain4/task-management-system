import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/errors/api_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.read(apiClientProvider),
    storage: ref.read(secureStorageProvider),
  );
});

class AuthResult {
  final UserModel user;

  const AuthResult({required this.user});
}

class AuthRepository {
  AuthRepository({
    required ApiClient apiClient,
    required SecureStorageService storage,
  })  : _apiClient = apiClient,
        _storage = storage;

  final ApiClient _apiClient;
  final SecureStorageService _storage;

  Future<AuthResult> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/auth/register',
      data: {
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
      },
      requiresAuth: false,
    );

    final user = await _persistSessionFromAuthResponse(
      response.data as Map<String, dynamic>,
    );
    return AuthResult(user: user);
  }

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      '/auth/login',
      data: {
        'email': email.trim(),
        'password': password,
      },
      requiresAuth: false,
    );

    final user = await _persistSessionFromAuthResponse(
      response.data as Map<String, dynamic>,
    );
    return AuthResult(user: user);
  }

  Future<AuthResult> refreshSession() async {
    final response = await _apiClient.refreshSession();
    final user = await _persistSessionFromAuthResponse(
      response.data as Map<String, dynamic>,
    );
    return AuthResult(user: user);
  }

  Future<void> logout() async {
    try {
      await _apiClient.post(
        '/auth/logout',
        requiresAuth: false,
        includeRefreshCookie: true,
      );
    } catch (_) {
      // Ignore server-side logout failures and still clear local state.
    } finally {
      await _storage.clearSession();
    }
  }

  Future<UserModel> _persistSessionFromAuthResponse(
    Map<String, dynamic> responseBody,
  ) async {
    final data = responseBody['data'];
    if (data is! Map<String, dynamic>) {
      throw const ApiException('Invalid authentication response');
    }

    final userJson = data['user'];
    final accessToken = data['accessToken'] as String?;
    final refreshToken = data['refreshToken'] as String?;

    if (userJson is! Map<String, dynamic> ||
        accessToken == null ||
        refreshToken == null) {
      throw const ApiException('Session information is incomplete');
    }

    final user = UserModel.fromJson(userJson);

    await _storage.saveSession(
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    );

    return user;
  }
}