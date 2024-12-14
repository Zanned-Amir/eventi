import 'package:eventi_mobile/data/services/settings_services.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:validators/validators.dart';

class AuthController extends GetxController {
  final SettingsServices settingsServices = Get.find<SettingsServices>();

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  Future<void> login() async {
    final email = emailController.text;
    final password = passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      Get.snackbar(
        "Error",
        "Please fill in all fields",
        snackPosition: SnackPosition.TOP,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return;
    }

    if (isEmail(email) == false) {
      Get.snackbar(
        "Error",
        "Invalid email format",
        snackPosition: SnackPosition.TOP,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return;
    }

    try {
      final response = await settingsServices.dio.post(
        "/auth/login",
        data: {
          "email": email,
          "password": password,
        },
      );

      if (response.statusCode == 200) {
        Get.snackbar(
          "Login Successful",
          "Welcome back!",
          snackPosition: SnackPosition.TOP,
          backgroundColor: Colors.greenAccent,
          colorText: Colors.white,
        );

        // Navigate to home page
        Get.offNamed('/home');
      } else {
        Get.snackbar(
          "Login Failed",
          response.data['message'] ??
              response.data['message'][0] ??
              'Unknown error',
          snackPosition: SnackPosition.TOP,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        "Error",
        "An error occurred. Please try again later.",
        snackPosition: SnackPosition.TOP,
      );
    }
  }

  logout() async {
    final response = await settingsServices.dio.post("/auth/logout");
    if (response.statusCode != 204) {
      Get.snackbar(
        "Logout Failed",
        response.data['message'] ?? 'Unknown error',
        snackPosition: SnackPosition.TOP,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return;
    } else {
      Get.offNamed('/login');
      settingsServices.clearTokens();
      Get.snackbar(
        "Logout",
        "You have been logged out",
        snackPosition: SnackPosition.TOP,
        backgroundColor: Colors.greenAccent,
      );
    }
  }

  isAuthenticated() {
    final authToken = settingsServices.getRefreshToken();
    return authToken != null;
  }
}
