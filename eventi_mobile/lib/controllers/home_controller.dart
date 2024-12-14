// home_controller.dart
import 'package:eventi_mobile/data/services/settings_services.dart';
import 'package:get/get.dart';

class HomeController extends GetxController {
  late SettingsServices settingsServices = Get.find<SettingsServices>();

  // Observable index to track selected tab
  var selectedIndex = 0.obs;

  // Method to update the selected index
  void onTabSelected(int index) {
    selectedIndex.value = index;
  }

  // logout
}
