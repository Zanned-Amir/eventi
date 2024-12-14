import 'package:eventi_mobile/controllers/register_controller.dart';
import 'package:eventi_mobile/views/widgets/my_button.dart';
import 'package:eventi_mobile/views/widgets/my_textfiled.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class RegisterAccount extends StatelessWidget {
  RegisterAccount({Key? key}) : super(key: key);

  final RegisterController controller = Get.find<RegisterController>();

  // Initialize the controller

  // Function to select birth date
  Future<void> _selectBirthDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      controller.birthDate.value = picked;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[300],
      body: SafeArea(
        child: SingleChildScrollView(
          child: Center(
            child: Column(
              children: [
                const SizedBox(height: 50),
                const Icon(Icons.lock, size: 100),
                const SizedBox(height: 50),
                Text(
                  'Last step to create an account',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 25),

                // First Name TextField
                MyTextFiled(
                  hintText: 'First Name',
                  obscureText: false,
                  controller: controller.firstNameController,
                ),
                const SizedBox(height: 10),

                // Last Name TextField
                MyTextFiled(
                  hintText: 'Last Name',
                  obscureText: false,
                  controller: controller.lastNameController,
                ),
                const SizedBox(height: 20),

                // Gender Selection
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 25.0),
                  alignment: Alignment.centerLeft,
                  child: const Text(
                    'Gender',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Obx(() => RadioListTile<String>(
                      title: const Text('Male'),
                      value: 'M',
                      groupValue: controller.gender.value,
                      onChanged: (value) => controller.gender.value = value!,
                    )),
                Obx(() => RadioListTile<String>(
                      title: const Text('Female'),
                      value: 'F',
                      groupValue: controller.gender.value,
                      onChanged: (value) => controller.gender.value = value!,
                    )),
                const SizedBox(height: 10),

                // Birth Date Picker
                GestureDetector(
                  onTap: () => _selectBirthDate(context),
                  child: Obx(
                    () => Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      margin: const EdgeInsets.symmetric(horizontal: 25.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            controller.birthDate.value == null
                                ? 'Select Birth Date'
                                : '${controller.birthDate.value!.day}/${controller.birthDate.value!.month}/${controller.birthDate.value!.year}',
                            style: TextStyle(
                              color: controller.birthDate.value == null
                                  ? Colors.grey
                                  : Colors.black,
                            ),
                          ),
                          const Icon(Icons.calendar_today, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 25),

                // Register Button
                MyButton(
                  onTap: () {
                    controller.register();
                  },
                  text: "Register",
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
