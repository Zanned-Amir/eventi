import 'dart:ui';

import 'package:dio/dio.dart';
import 'package:eventi_mobile/data/services/settings_services.dart';
import 'package:eventi_mobile/utils/logger.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:eventi_mobile/models/role.dart';
import 'package:eventi_mobile/models/userAccount.dart';
import 'package:eventi_mobile/models/userLoginData.dart';

class ProfileController extends GetxController {
  // Observables
  var userAccount = Rxn<UserAccount>();
  var userLoginData = Rxn<UserLoginData>();
  var role = Rxn<Role>();

  var isLoading = false.obs;

  final SettingsServices settingsServices = Get.find<SettingsServices>();
  late Dio dio = settingsServices.dio;

  // Fetch profile data
  Future<void> fetchProfile() async {
    try {
      isLoading.value = true;

      final response = await dio.get("/users/profile");
      MyLogger.logger.d(response.data);

      if (response.statusCode == 200) {
        final data = response.data['data'];
        // Parse the data into models
        userAccount.value = UserAccount(
          roleId: data['role_id'],
          createdAt: DateTime.parse(data['created_at']),
          updatedAt: DateTime.parse(data['updated_at']),
          userId: data['user_id'],
          firstName: data['first_name'],
          lastName: data['last_name'],
          gender: data['gender'],
          birthDate: DateTime.parse(data['birth_date']),
        );

        userLoginData.value = UserLoginData.fromJson(data['userLoginData']);

        role.value = Role.fromJson(data['role']);
      } else {
        print("Error: ${response.statusCode}, ${response.data}");
        MyLogger.logger.e(response.data['message']);
        Get.snackbar(
          "Error",
          "Failed to fetch profile data",
          backgroundColor: Colors.red,
          snackPosition: SnackPosition.TOP,
        );
      }
    } catch (e) {
      Get.snackbar(
        "Error",
        "An error occurred while fetching profile data",
        backgroundColor: Colors.red,
        snackPosition: SnackPosition.TOP,
      );
    } finally {
      isLoading.value = false;
    }
  }
}
