import 'package:eventi_mobile/controllers/auth_controller.dart';
import 'package:get/get.dart';

class BaseBindings implements Bindings {
  @override
  void dependencies() {
    Get.put<AuthController>(AuthController(), permanent: true);
  }
}
