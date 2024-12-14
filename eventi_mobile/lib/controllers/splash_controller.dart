import 'package:eventi_mobile/controllers/auth_controller.dart';
import 'package:eventi_mobile/data/services/settings_services.dart';
import 'package:eventi_mobile/utils/logger.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SplashController extends GetxController {
  final SettingsServices settingsServices = Get.find<SettingsServices>();

  @override
  void onReady() async {
    super.onReady();

    // Wait for health check to complete
    MyLogger.logger.d("Waiting for health check to complete");

    await settingsServices.waitForHealthCheck();

    MyLogger.logger.d("Health check completed");
    // Show a snackbar based on the server status
    if (settingsServices.isHealthCheck.value) {
    } else {
      Get.snackbar(
        "Connection Error",
        "Please try again later",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 3),
      );
    }

    // Check if user is authenticated and navigate accordingly
    if (Get.find<AuthController>().isAuthenticated()) {
      Get.offNamed('/home');
    } else {
      Get.offNamed('/login');
    }
  }
}
