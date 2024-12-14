import 'dart:async';

import 'package:dio/dio.dart';
import 'package:eventi_mobile/constants/env.dart';
import 'package:eventi_mobile/interceptor/cookie_interceptor.dart';
import 'package:eventi_mobile/utils/logger.dart';
import 'package:get/get.dart';
import 'package:get/get_state_manager/get_state_manager.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsServices extends GetxService {
  late SharedPreferences sharedPrefs;
  late Dio dio;
  var isHealthCheck = false.obs;

  final Completer<void> healthCheckCompleter = Completer<void>();

  Future<SettingsServices> init() async {
    sharedPrefs = await SharedPreferences.getInstance();
    dio = Dio(
      BaseOptions(
        baseUrl: API_URL,
        connectTimeout: Duration(seconds: 5),
        receiveTimeout: Duration(seconds: 5),
        validateStatus: (status) {
          return status != null; // Consider all status codes as valid
        },
      ),
    );

    dio.interceptors.add(CookieInterceptor());
    MyLogger.logger.i("SettingsServices initialized");

    dio.get("/health-check").then((response) {
      if (response.statusCode == 200) {
        MyLogger.logger.i("Health check: ${response.data}");

        isHealthCheck.value = true;
        healthCheckCompleter.complete();
      } else {
        MyLogger.logger.e("Health check failed: ${response.data}");
        healthCheckCompleter.complete();
      }
    }).catchError((error) {
      MyLogger.logger.e("Health check failed: $error");
      if (!healthCheckCompleter.isCompleted) {
        healthCheckCompleter.complete();
      }
    });

    return this;
  }

  waitForHealthCheck() async {
    await healthCheckCompleter.future;
  }

  storeAuthToken(String token) async {
    await sharedPrefs.setString('Authentication', token);
  }

  String? getAuthToken() {
    return sharedPrefs.getString('Authentication');
  }

  storeRefreshToken(String token) async {
    await sharedPrefs.setString('Refresh', token);
  }

  String? getRefreshToken() {
    return sharedPrefs.getString('Refresh');
  }

  clearTokens() async {
    await sharedPrefs.remove('Authentication');
    await sharedPrefs.remove('Refresh');
  }
}
