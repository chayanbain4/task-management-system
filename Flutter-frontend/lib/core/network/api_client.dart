import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import '../errors/api_exception.dart';
import '../storage/secure_storage_service.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    ref: ref,
    storage: ref.read(secureStorageProvider),
  );
});

class ApiClient {
  ApiClient({
    required Ref ref,
    required SecureStorageService storage,
  })  : _storage = storage,
        _dio = Dio(
          BaseOptions(
            baseUrl: AppConfig.baseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 20),
            sendTimeout: const Duration(seconds: 20),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          ),
        ),
        _refreshDio = Dio(
          BaseOptions(
            baseUrl: AppConfig.baseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 20),
            sendTimeout: const Duration(seconds: 20),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final skipAuth = options.extra['skipAuth'] == true;
          final includeRefreshCookie = options.extra['includeRefreshCookie'] == true;

          if (!skipAuth) {
            final accessToken = await _storage.readAccessToken();
            if (accessToken != null && accessToken.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $accessToken';
            }
          }

          if (includeRefreshCookie) {
            final refreshToken = await _storage.readRefreshToken();
            if (refreshToken != null && refreshToken.isNotEmpty) {
              options.headers['Cookie'] = 'refreshToken=$refreshToken';
            }
          }

          handler.next(options);
        },
        onResponse: (response, handler) async {
          await _captureRefreshTokenFromResponse(response);
          handler.next(response);
        },
        onError: (error, handler) async {
          final originalRequest = error.requestOptions;
          final shouldTryRefresh = error.response?.statusCode == 401 &&
              originalRequest.extra['retryAttempted'] != true &&
              originalRequest.path != '/auth/login' &&
              originalRequest.path != '/auth/register' &&
              originalRequest.path != '/auth/refresh' &&
              originalRequest.path != '/auth/logout';

          if (!shouldTryRefresh) {
            handler.reject(_mapDioException(error));
            return;
          }

          try {
            final refreshResponse = await refreshSession();
            final newAccessToken = ((refreshResponse.data as Map<String, dynamic>)['data']
                as Map<String, dynamic>)['accessToken'] as String?;

            if (newAccessToken == null || newAccessToken.isEmpty) {
              throw const ApiException('Unable to refresh session', statusCode: 401);
            }

            originalRequest.headers['Authorization'] = 'Bearer $newAccessToken';

            final retriedResponse = await _dio.fetch<dynamic>(
              originalRequest.copyWith(
                extra: {
                  ...originalRequest.extra,
                  'retryAttempted': true,
                },
              ),
            );

            handler.resolve(retriedResponse);
          } catch (_) {
            await _storage.clearSession();
            handler.reject(
              DioException(
                requestOptions: originalRequest,
                error: const ApiException('Session expired. Please login again.', statusCode: 401),
              ),
            );
          }
        },
      ),
    );
  }

  final SecureStorageService _storage;
  final Dio _dio;
  final Dio _refreshDio;

  Future<Response<dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    bool requiresAuth = true,
  }) {
    return _perform(() {
      return _dio.get(
        path,
        queryParameters: queryParameters,
        options: Options(extra: {'skipAuth': !requiresAuth}),
      );
    });
  }

  Future<Response<dynamic>> post(
    String path, {
    Object? data,
    bool requiresAuth = true,
    bool includeRefreshCookie = false,
  }) {
    return _perform(() {
      return _dio.post(
        path,
        data: data,
        options: Options(
          extra: {
            'skipAuth': !requiresAuth,
            'includeRefreshCookie': includeRefreshCookie,
          },
        ),
      );
    });
  }

  Future<Response<dynamic>> patch(
    String path, {
    Object? data,
    bool requiresAuth = true,
  }) {
    return _perform(() {
      return _dio.patch(
        path,
        data: data,
        options: Options(extra: {'skipAuth': !requiresAuth}),
      );
    });
  }

  Future<Response<dynamic>> delete(
    String path, {
    bool requiresAuth = true,
  }) {
    return _perform(() {
      return _dio.delete(
        path,
        options: Options(extra: {'skipAuth': !requiresAuth}),
      );
    });
  }

  Future<Response<dynamic>> refreshSession() async {
    final refreshToken = await _storage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      throw const ApiException('Refresh token not found', statusCode: 401);
    }

    try {
      final response = await _refreshDio.post(
        '/auth/refresh',
        options: Options(
          headers: {
            'Cookie': 'refreshToken=$refreshToken',
          },
        ),
      );

      await _captureRefreshTokenFromResponse(response);

      final body = response.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;

      final accessToken = data?['accessToken'] as String?;
      if (accessToken != null && accessToken.isNotEmpty) {
        await _storage.saveAccessToken(accessToken);
      }

      return response;
    } on DioException catch (e) {
      throw _extractApiException(e);
    }
  }

  Future<void> _captureRefreshTokenFromResponse(Response<dynamic> response) async {
    final setCookies = response.headers.map['set-cookie'];
    if (setCookies == null || setCookies.isEmpty) return;

    for (final cookie in setCookies) {
      final match = RegExp(r'refreshToken=([^;]+)').firstMatch(cookie);
      if (match != null) {
        final token = match.group(1);
        if (token != null && token.isNotEmpty) {
          await _storage.saveRefreshToken(token);
          return;
        }
      }
    }
  }

  Future<Response<dynamic>> _perform(
    Future<Response<dynamic>> Function() request,
  ) async {
    try {
      return await request();
    } on DioException catch (e) {
      throw _extractApiException(e);
    }
  }

  DioException _mapDioException(DioException error) {
    if (error.error is ApiException) return error;

    return DioException(
      requestOptions: error.requestOptions,
      response: error.response,
      error: _extractApiException(error),
      type: error.type,
    );
  }

  ApiException _extractApiException(DioException error) {
    if (error.error is ApiException) {
      return error.error as ApiException;
    }

    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    if (data is Map<String, dynamic>) {
      final message = data['message'] as String?;
      if (message != null && message.isNotEmpty) {
        return ApiException(message, statusCode: statusCode);
      }
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return const ApiException('Connection timed out. Please try again.');
    }

    if (error.type == DioExceptionType.connectionError) {
      return const ApiException('Could not connect to server. Check your backend URL.');
    }

    return ApiException(
      'Something went wrong. Please try again.',
      statusCode: statusCode,
    );
  }
}
