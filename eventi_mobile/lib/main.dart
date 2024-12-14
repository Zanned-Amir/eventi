import 'package:eventi_mobile/bindings/base_bindings.dart';
import 'package:eventi_mobile/data/services/settings_services.dart';
import 'package:eventi_mobile/views/pages/home.dart';
import 'package:eventi_mobile/views/pages/login.dart';
import 'package:eventi_mobile/views/pages/profile.dart';
import 'package:eventi_mobile/views/pages/register.dart';
import 'package:eventi_mobile/views/pages/registerAccount.dart';
import 'package:eventi_mobile/views/pages/splash.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/get_core.dart';
import 'package:get/get_navigation/src/root/get_material_app.dart';
import 'package:get/get_navigation/src/routes/get_route.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initalServices();
  runApp(MyApp());
}

Future<void> initalServices() async {
  await Get.putAsync(() => SettingsServices().init());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.grey[900],
          titleTextStyle: TextStyle(color: Colors.white, fontSize: 20),
          iconTheme: IconThemeData(color: Colors.white),
          centerTitle: true,
        ),
        scaffoldBackgroundColor: Colors.grey[300],
      ),
      initialBinding: BaseBindings(),
      initialRoute: '/splash',
      getPages: [
        GetPage(name: '/home', page: () => Home()),
        GetPage(name: '/login', page: () => Login()),
        GetPage(name: '/register', page: () => Register()),
        GetPage(name: '/registerAccount', page: () => RegisterAccount()),
        GetPage(name: '/splash', page: () => SplashScreen()),
        GetPage(name: '/profile', page: () => Profile.fromArguments()),
      ],
    );
  }
}
