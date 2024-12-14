import 'package:flutter/material.dart';
import 'package:get/get.dart';

class MyTextFiled extends StatelessWidget {
  final String hintText;
  final bool obscureText; // Initial visibility state
  final TextEditingController controller;
  final TextStyle? textStyle; // Customizable text style
  final TextStyle? hintStyle; // Customizable hint text style
  final Color borderColor; // Border color for both states
  final Color fillColor; // Background fill color

  MyTextFiled({
    super.key,
    required this.hintText,
    required this.obscureText,
    required this.controller,
    this.textStyle,
    this.hintStyle,
    this.borderColor = Colors.grey,
    this.fillColor = Colors.grey,
  });

  @override
  Widget build(BuildContext context) {
    // Using RxBool for password visibility state
    RxBool isObscured = (obscureText).obs;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 25.0),
      child: Obx(() => TextField(
            controller: controller,
            obscureText: isObscured.value, // Use the reactive state here
            style: textStyle, // Apply customizable text style
            decoration: InputDecoration(
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: borderColor),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: borderColor),
              ),
              fillColor: fillColor,
              filled: true,
              hintText: hintText,
              hintStyle: hintStyle, // Apply customizable hint text style
              suffixIcon: hintText.toLowerCase() == "password"
                  ? IconButton(
                      icon: Icon(
                        isObscured.value
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: borderColor,
                      ),
                      onPressed: () {
                        // Toggle password visibility
                        isObscured.value = !isObscured.value;
                      },
                    )
                  : null, // Only show the toggle icon for password field
            ),
          )),
    );
  }
}
