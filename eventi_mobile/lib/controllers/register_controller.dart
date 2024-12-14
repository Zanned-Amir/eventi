import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:eventi_mobile/utils/logger.dart';
import 'package:eventi_mobile/data/services/settings_services.dart';
import 'package:validators/validators.dart';

class RegisterController extends GetxController {
  // Text controllers
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final usernameController = TextEditingController();

  var email = ''.obs;
  var password = ''.obs;

  RxString gender = ''.obs;
  Rx<DateTime?> birthDate = Rx<DateTime?>(null);

  // Regex validation functions
  bool validateName(String name) {
    return RegExp(r"^[a-zA-Z\s-]{2,50}$").hasMatch(name);
  }

  bool validateUsername(String username) {
    return RegExp(r"^[a-zA-Z0-9_]{3,20}$").hasMatch(username);
  }

  bool validateEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  bool validatePassword(String password) {
    return password.length >= 6;
  }

  // Validation before registration
  checkRegisterPageOne() {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    final confirmPassword = confirmPasswordController.text.trim();
    final username = usernameController.text.trim();

    // Email validation
    if (!isEmail(email)) {
      MyLogger.logger.d(": " + email);
      Get.snackbar(
        "Error",
        "Invalid email format",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    // Username validation
    if (!validateUsername(username)) {
      Get.snackbar(
        "Error",
        "Username must be 3-20 characters and contain only letters, numbers, or underscores.",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    // Password validation
    if (!validatePassword(password)) {
      Get.snackbar(
        "Error",
        "Password must be at least 6 characters long.",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    if (password != confirmPassword) {
      Get.snackbar(
        "Error",
        "Passwords do not match.",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    this.email.value = email;
    this.password.value = password;

    Get.toNamed('/registerAccount');
  }

  Future<void> register() async {
    MyLogger.logger.d("Registering user");

    final firstName = firstNameController.text.trim();
    final lastName = lastNameController.text.trim();

    // Validate first name and last name
    if (!validateName(firstName)) {
      Get.snackbar(
        "Error",
        "First name must be 2-50 characters and contain only letters, spaces, or hyphens.",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    if (!validateName(lastName)) {
      Get.snackbar(
        "Error",
        "Last name must be 2-50 characters and contain only letters, spaces, or hyphens.",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    if (gender.isEmpty) {
      Get.snackbar(
        "Error",
        "Please select a gender",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    if (birthDate.value == null) {
      Get.snackbar(
        "Error",
        "Please select your birth date",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
        animationDuration: Duration(milliseconds: 500),
        duration: Duration(seconds: 2),
      );
      return;
    }

    // API Call
    try {
      final data = {
        'userAccount': {
          'first_name': firstName,
          'last_name': lastName,
          'gender': gender.value,
          // convert DateTime to ISO  date string
          'birth_date': birthDate.value?.toIso8601String().split('T')[0],
        },
        'userLoginData': {
          'email': this.email.value,
          'password': this.password.value,
          'username': usernameController.text.trim(),
        }
      };
      MyLogger.logger.d(data);
      final response = await Get.find<SettingsServices>()
          .dio
          .post('/auth/register', data: data);
      MyLogger.logger.i(response.data);

      if (response.statusCode == 201) {
        Get.snackbar(
          "Success",
          "Account created successfully",
          backgroundColor: Colors.greenAccent,
          snackPosition: SnackPosition.TOP,
        );
        Get.offNamed('/login');

        emailController.clear();
        passwordController.clear();
        confirmPasswordController.clear();
        firstNameController.clear();
        lastNameController.clear();
        usernameController.clear();
      } else {
        Get.snackbar(
          "Error",
          response.data['message'][0] ??
              response.data['message'] ??
              'Unknown error',
          backgroundColor: Colors.redAccent,
          snackPosition: SnackPosition.TOP,
        );

        Get.offNamed('/register');
      }
    } catch (e) {
      MyLogger.logger.e(e);

      Get.snackbar(
        "Error",
        "An error occurred while registering",
        backgroundColor: Colors.redAccent,
        snackPosition: SnackPosition.TOP,
      );
    }
  }
}
