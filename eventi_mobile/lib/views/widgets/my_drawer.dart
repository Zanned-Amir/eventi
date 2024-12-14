import 'package:eventi_mobile/controllers/auth_controller.dart';
import 'package:eventi_mobile/controllers/profile_controller.dart';
import 'package:eventi_mobile/views/widgets/my_list_tile.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class MyDrawer extends StatelessWidget {
  const MyDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.find<AuthController>();
    final ProfileController profileController =
        Get.find<ProfileController>(); // Ensure correct reference

    // Fetch profile if it's not already loaded
    if (profileController.userAccount.value == null) {
      profileController.fetchProfile();
    }

    return Drawer(
      backgroundColor: Colors.grey[900],
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            children: [
              // Header with profile data
              Obx(() {
                if (profileController.isLoading.value) {
                  return const DrawerHeader(
                    child: Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  );
                }

                final userAccount = profileController.userAccount.value;

                if (userAccount != null) {
                  return DrawerHeader(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.person,
                          color: Colors.white,
                          size: 64,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "${userAccount.firstName} ${userAccount.lastName}",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return const DrawerHeader(
                  child: Icon(
                    Icons.person,
                    color: Colors.white,
                    size: 64,
                  ),
                );
              }),

              // Home list tile
              MyListTile(
                icon: Icons.home,
                title: 'H O M E',
                onTap: () => Get.offNamed("/home"),
              ),

              // Profile list tile
              MyListTile(
                icon: Icons.person,
                title: 'P R O F I L E',
                onTap: () async {
                  Get.toNamed(
                    "/profile",
                    arguments: {
                      "userAccount": profileController.userAccount.value,
                      "userLoginData": profileController.userLoginData.value,
                      "role": profileController.role.value,
                    },
                  );
                },
              ),

              // Settings list tile
              MyListTile(
                icon: Icons.settings,
                title: 'S E T T I N G S',
                onTap: () => Get.toNamed("settings"),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(25.0),
            child: MyListTile(
              icon: Icons.logout,
              title: "L O G O U T",
              onTap: () {
                authController.logout();
              },
            ),
          ),
        ],
      ),
    );
  }
}
