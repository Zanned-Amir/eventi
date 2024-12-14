import 'package:eventi_mobile/data/services/settings_services.dart';
import 'package:eventi_mobile/utils/helper.dart';
import 'package:eventi_mobile/utils/logger.dart';
import 'package:eventi_mobile/views/widgets/infoDialog.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
import 'package:gif/gif.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ScannerController extends GetxController {
  final SettingsServices settingsServices = Get.find();
  final MobileScannerController scanner = MobileScannerController();

  var isLoading = false.obs; // To handle loading state
  var isProcessing = false.obs; // To ensure single request per scan

  // Start the scanner for check ticket and staff access
  void startScanForCheckTicket() {
    if (isProcessing.value) return; // Ignore if already processing
    scanner.start();
  }

  void startScanForStaffAccess() {
    if (isProcessing.value) return; // Ignore if already processing
    scanner.start();
  }

  // Stop the scanner and close dialog
  void stopScan() {
    scanner.stop();
  }

  // Function to handle detection (for both check ticket and staff access)
  void onDetect(BarcodeCapture capture, {required bool isCheckTicketPage}) {
    if (isProcessing.value) return; // Prevent processing if already active
    if (capture.barcodes.isNotEmpty) {
      final barcode = capture.barcodes.first;
      if (barcode.rawValue != null) {
        isProcessing.value = true; // Set processing state
        final qrCodeData =
            barcode.rawValue!.split(':'); // Split the QR code data

        if (isCheckTicketPage) {
          if (qrCodeData.length == 3) {
            final concertId = int.parse(qrCodeData[0]);
            final ticketCode = qrCodeData[1];
            final signature = qrCodeData[2];

            _validateTicket(concertId, ticketCode,
                signature); // Call API for ticket validation
          } else {
            Get.snackbar(
              'Invalid QR code for ticket',
              'QR code must contain concert ID and ticket code',
              snackPosition: SnackPosition.TOP,
              backgroundColor: Colors.redAccent,
            );
            isProcessing.value = false; // Reset processing state
          }
        } else {
          if (qrCodeData.length == 4) {
            final concertId = int.parse(qrCodeData[0]);
            final concertRoleId = int.parse(qrCodeData[1]);
            final accessCode = qrCodeData[2];
            final signature = qrCodeData[3];
            MyLogger.logger.i(qrCodeData);

            _checkAccess(concertId, concertRoleId, accessCode,
                signature); // Call API for access check
          } else {
            Get.snackbar(
              'Invalid QR code for access',
              'QR code must contain concert ID, concert role ID, and access code',
              snackPosition: SnackPosition.TOP,
              backgroundColor: Colors.redAccent,
            );

            isProcessing.value = false; // Reset processing state
          }
        }

        stopScan();

        Get.back(result: true);
      }
    }
  }

  // Validate Ticket via API call
  // Validate Ticket via API call
  Future<void> _validateTicket(
      int concertId, String ticketCode, String signature) async {
    isLoading.value = true;
    try {
      final response = await settingsServices.dio.post(
        '/tickets/validate/$concertId/ticket-code',
        data: {
          'ticket_code_h': ticketCode,
          'signature': signature,
        },
      );

      final statusCode = response.statusCode;
      final data = response.data;

      MyLogger.logger.i(response.data);

      if (statusCode == 200) {
        // Display success bottom sheet
        Get.bottomSheet(
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Gif(
                  image: const AssetImage("lib/assets/gif/check.gif"),
                  autostart: Autostart.once,
                  height: 250,
                ),
                const SizedBox(height: 20),
                const Text(
                  'Ticket Valid',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
                const SizedBox(height: 10),
                ElevatedButton.icon(
                  onPressed: () => Get.back(),
                  icon: const Icon(Icons.done),
                  label: const Text('Close'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ],
            ),
          ),
          isScrollControlled: true,
        );
      } else {
        // Safely handle errors
        final message = data?['message'] ??
            (data?['message'] is List ? data['message'][0] : null) ??
            'Unknown error';
        Get.snackbar(
          'Ticket Invalid',
          message,
          snackPosition: SnackPosition.TOP,
          backgroundColor: Colors.redAccent,
        );
      }
    } catch (e) {
      // Log and show generic error message
      MyLogger.logger.e(e);
      Get.snackbar(
        'Error',
        'An error occurred while validating the ticket',
        snackPosition: SnackPosition.TOP,
        backgroundColor: Colors.redAccent,
      );
    } finally {
      isLoading.value = false;
      isProcessing.value = false;
    }
  }

  // Check Access (Concert Role)
  Future<void> _checkAccess(int concertId, int concertRoleId, String accessCode,
      String signature) async {
    isLoading.value = true;
    try {
      final response = await settingsServices.dio.get(
        '/auth/check/concert/$concertId/concert-role/$concertRoleId',
        data: {'access_code': accessCode, 'signature': signature},
      );
      final data = response.data;

      MyLogger.logger.i(response.data);

      if (response.statusCode == 200) {
        final concertRoleData = response.data['data'];
        if (concertRoleData != null) {
          // Process the data for bottomSheet
          final Map<String, dynamic> infoMap = {
            ...concertRoleData,
            ...concertRoleData['concert'],
            ...concertRoleData['role'],
            ...concertRoleData['concertMember'],
          };

          // Remove unnecessary keys
          infoMap.remove('concert');
          infoMap.remove('role');
          infoMap.remove('concertMember');

          MyLogger.logger.i(infoMap);

          final infoProcessed = convertToStringMapWithDateCheck(infoMap);
          whitelistKeyMap(
              infoMap, ['concert_member_id', 'role_id', 'concert_id']);
          MyLogger.logger.i(infoProcessed);

          Get.bottomSheet(
            Container(
              child: InfoDialog(infoMap: infoProcessed),
            ),
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
          );
        } else {
          Get.snackbar('Error', 'No concert role data found',
              snackPosition: SnackPosition.TOP,
              backgroundColor: Colors.redAccent);
        }
      } else {
        final message = data?['message'] ??
            (data?['message'] is List ? data['message'][0] : null) ??
            'Unknown error';
        Get.snackbar(
          'Access Denied',
          message,
          snackPosition: SnackPosition.TOP,
          backgroundColor: Colors.redAccent,
        );
      }
    } catch (e) {
      MyLogger.logger.e('Error in _checkAccess: $e');

      Get.snackbar(
        'Error',
        'An error occurred while checking access',
        snackPosition: SnackPosition.TOP,
        backgroundColor: Colors.redAccent,
      );
    } finally {
      isLoading.value = false;
      isProcessing.value = false; // Reset processing state
    }
  }

  @override
  void onClose() {
    scanner.dispose();
    super.onClose();
  }
}
