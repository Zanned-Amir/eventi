import 'package:eventi_mobile/controllers/profile_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:eventi_mobile/models/role.dart';
import 'package:eventi_mobile/models/userAccount.dart';
import 'package:eventi_mobile/models/userLoginData.dart';
import 'package:eventi_mobile/views/widgets/text_box.dart';

class Profile extends StatelessWidget {
  final UserAccount? userAccount;
  final UserLoginData? userLoginData;
  final Role? role;

  Profile({
    super.key,
    this.userAccount,
    this.userLoginData,
    this.role,
  });

  factory Profile.fromArguments() {
    final args = Get.arguments as Map<String, dynamic>?; // Handle nullable
    return Profile(
      userAccount: args?['userAccount'] as UserAccount?,
      userLoginData: args?['userLoginData'] as UserLoginData?,
      role: args?['role'] as Role?,
    );
  }

  final ProfileController profileController = Get.find<ProfileController>();

  @override
  Widget build(BuildContext context) {
    profileController.fetchProfile();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile Page'),
        backgroundColor: Colors.grey[900],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Trigger profile fetching when pulled to refresh
          await profileController.fetchProfile();
        },
        child: Obx(() {
          if (profileController.isLoading.value) {
            return const Center(child: CircularProgressIndicator());
          }

          final fetchedUserAccount =
              userAccount ?? profileController.userAccount.value;
          final fetchedUserLoginData =
              userLoginData ?? profileController.userLoginData.value;
          final fetchedRole = role ?? profileController.role.value;

          if (fetchedUserAccount == null ||
              fetchedUserLoginData == null ||
              fetchedRole == null) {
            return const Center(child: Text("Failed to load profile data."));
          }

          return ListView(
            // Ensures pull-to-refresh even when content is less
            children: [
              const SizedBox(height: 50),
              const Icon(Icons.person, size: 72),

              // Username
              Text(
                fetchedUserLoginData.username,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[700]),
              ),

              const SizedBox(height: 50),

              // Details section
              Padding(
                padding: const EdgeInsets.only(left: 25.0),
                child: Text(
                  "My Details",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
                ),
              ),

              MyTextBox(
                text: fetchedUserLoginData.email,
                sectionName: "Email",
                onPressed: () => _editField(context, "email"),
                isEditable: false,
              ),
              MyTextBox(
                text: fetchedUserAccount.firstName,
                sectionName: "First Name",
                onPressed: () => _editField(context, "First Name"),
                isEditable: false,
              ),
              MyTextBox(
                text: fetchedUserAccount.lastName,
                sectionName: "Last Name",
                onPressed: () => _editField(context, "Last Name"),
                isEditable: false,
              ),

              // if M or F, show Male  or Female
              MyTextBox(
                text: fetchedUserAccount.gender == "M" ? " Male" : "Female",
                sectionName: "Gender",
                onPressed: () => _editField(context, "Gender"),
                isEditable: false,
              ),

              // Birth Date to String visible in the UI
              MyTextBox(
                text: fetchedUserAccount.birthDate.toString().split(" ")[0],
                sectionName: "Birth Date",
                onPressed: () => _editField(context, "Birth Date"),
                isEditable: false,
              ),
              if (fetchedRole.roleName != "USER")
                MyTextBox(
                  text: fetchedRole.roleName,
                  sectionName: "Role",
                  onPressed: () => _editField(context, "Role"),
                  isEditable: false,
                ),
            ],
          );
        }),
      ),
    );
  }

  Future<void> _editField(BuildContext context, String field) async {
    String newValue = "";
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: Text("Edit $field", style: const TextStyle(color: Colors.white)),
        content: TextField(
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: "Enter new $field",
            hintStyle: const TextStyle(color: Colors.grey),
          ),
          onChanged: (value) {
            newValue = value;
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: 1),
            child: const Text("Cancel", style: TextStyle(color: Colors.white)),
          ),
          TextButton(
            onPressed: () => Get.back(result: newValue),
            child: const Text("Save", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
