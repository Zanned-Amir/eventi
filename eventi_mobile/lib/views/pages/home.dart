// home.dart
import 'package:eventi_mobile/controllers/home_controller.dart';
import 'package:eventi_mobile/controllers/profile_controller.dart';
import 'package:eventi_mobile/controllers/scanner_controller.dart';
import 'package:eventi_mobile/views/pages/check_ticket.dart';
import 'package:eventi_mobile/views/pages/staff_access.dart';

import 'package:eventi_mobile/views/widgets/my_drawer.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Home extends StatelessWidget {
  Home({super.key});

  // Initialize controllers
  final HomeController controller = Get.put(HomeController());
  final ScannerController scannerController = Get.put(ScannerController());
  final ProfileController profileController = Get.put(ProfileController());

  // List of pages to display
  final List<Widget> pages = [
    CheckTicketPage(),
    StaffAccessPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[300],
      appBar: AppBar(
        title: const Text('Home Page'),
      ),
      drawer: const MyDrawer(),
      body: Obx(
          () => pages[controller.selectedIndex.value]), // Display selected page
      bottomNavigationBar: Obx(
        () => BottomNavigationBar(
          currentIndex: controller.selectedIndex.value,
          onTap: controller.onTabSelected,
          backgroundColor: Colors.grey[700],
          selectedItemColor: Colors.white,
          unselectedItemColor: Colors.grey[500],
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.qr_code_scanner),
              label: 'Check Ticket',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.verified_user),
              label: 'Staff Access',
            ),
          ],
        ),
      ),
    );
  }
}
