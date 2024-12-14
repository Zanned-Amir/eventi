import 'package:dio/dio.dart';
import 'package:eventi_mobile/constants/env.dart';
import 'package:eventi_mobile/utils/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CookieInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    final prefs = await SharedPreferences.getInstance();

    // Get cookies from SharedPreferences
    final authToken = prefs.getString('Authentication');
    final refreshToken = prefs.getString('Refresh');

    if (authToken != null) {
      options.headers['Cookie'] = 'Authentication=$authToken';
    }

    if (refreshToken != null) {
      options.headers['Cookie'] =
          '${options.headers['Cookie'] ?? ''}; Refresh=$refreshToken';
    }

    return handler.next(options);
  }

  @override
  Future<void> onResponse(
      Response response, ResponseInterceptorHandler handler) async {
    // Save tokens if they are updated in the response cookies
    final prefs = await SharedPreferences.getInstance();
    final cookies = response.headers['set-cookie'];

    if (cookies != null) {
      for (var cookie in cookies) {
        if (cookie.startsWith('Authentication=')) {
          final authToken = cookie.split(';')[0].split('=')[1];
          await prefs.setString('Authentication', authToken);
        }
        if (cookie.startsWith('Refresh=')) {
          final refreshToken = cookie.split(';')[0].split('=')[1];
          await prefs.setString('Refresh', refreshToken);
        }
      }
    }
    return handler.next(response);
  }

  @override
  Future<void> onError(
      DioException err, ErrorInterceptorHandler handler) async {
    final message = err.response?.data['message'] ?? '';
    if (err.response?.statusCode == 401 &&
        message == 'Invalid or expired refresh token') {
      // Handle token expiration (refresh mechanism)
      final isTokenRefreshed = await _refreshToken();

      if (isTokenRefreshed) {
        // Retry the failed request
        final retryRequest = await _retryRequest(err.requestOptions);
        return handler.resolve(retryRequest);
      }
    }
    return handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString('Refresh');

      if (refreshToken == null) return false;

      final dio = Dio();
      final response = await dio.post(
        '$API_URL/auth/refresh-token',
        options: Options(
          headers: {'Cookie': 'Refresh=$refreshToken'},
        ),
      );

      if (response.statusCode == 201) {
        // Save new tokens
        final newAuthToken = response.data['Authentication'];
        final newRefreshToken = response.data['Refresh'];

        await prefs.setString('Authentication', newAuthToken);
        await prefs.setString('Refresh', newRefreshToken);

        return true;
      } else {
        MyLogger.logger.e('Failed to refresh token: ${response.data}');
        // clear tokens
        await prefs.remove('Authentication');
        await prefs.remove('Refresh');
      }
    } catch (e) {
      MyLogger.logger.e('Failed to refresh token: $e');
    }
    return false;
  }

  Future<Response> _retryRequest(RequestOptions requestOptions) async {
    final prefs = await SharedPreferences.getInstance();
    final authToken = prefs.getString('Authentication');

    // Retry the request with updated token
    final updatedRequestOptions = requestOptions.copyWith(
      headers: {
        ...requestOptions.headers,
        'Cookie': 'Authentication=$authToken',
      },
    );

    return Dio().fetch(updatedRequestOptions);
  }
}
