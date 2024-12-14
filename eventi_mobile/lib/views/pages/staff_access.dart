import 'package:eventi_mobile/controllers/scanner_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class StaffAccessPage extends StatelessWidget {
  final ScannerController scannerController = Get.find<ScannerController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // logo staff access
          const Icon(Icons.verified_user, size: 100),
          const Center(child: Text('Staff Access Page')),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              scannerController.startScanForStaffAccess();
              Get.dialog(
                Scaffold(
                  appBar: AppBar(title: const Text('Scan QR Code')),
                  body: MobileScanner(
                    controller: scannerController.scanner,
                    onDetect: (capture) => scannerController.onDetect(capture,
                        isCheckTicketPage: false),
                  ),
                ),
              );
            },
            child: const Text('Start Scanner'),
          ),
        ],
      ),
    );
  }
}
