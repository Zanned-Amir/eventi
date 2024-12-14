import 'package:eventi_mobile/controllers/auth_controller.dart';
import 'package:eventi_mobile/views/widgets/my_button.dart';
import 'package:eventi_mobile/views/widgets/my_textfiled.dart';
import 'package:eventi_mobile/views/widgets/square_tile.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_navigation/get_navigation.dart';

class Login extends StatelessWidget {
  Login({Key? key}) : super(key: key);

  // text editing controller

  final AuthController authController = Get.find<AuthController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[300],
      body: SafeArea(
        child: SingleChildScrollView(
          child: Center(
            child: Column(
              children: [
                const SizedBox(
                  height: 50,
                ),

                // logo

                const Icon(Icons.lock, size: 100),
                const SizedBox(
                  height: 50,
                ),
                Text('welcome back you\'ve been missed',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[700])),
                const SizedBox(
                  height: 25,
                ),

                //email textfield

                MyTextFiled(
                    hintText: 'Email',
                    obscureText: false,
                    controller: authController.emailController),

                const SizedBox(
                  height: 10,
                ),

                //password textfield

                MyTextFiled(
                  hintText: 'Password',
                  obscureText: true,
                  controller: authController.passwordController,
                ),

                // forgot password

                const SizedBox(
                  height: 10,
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 25.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        'Forgot Password?',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),

                const SizedBox(
                  height: 25,
                ),

                // sign in button

                MyButton(
                  onTap: authController.login,
                  text: "Sign In",
                ),

                const SizedBox(
                  height: 50,
                ),

                // or continue with

                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 25.0,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Divider(
                          thickness: 0.5,
                          color: Colors.grey[400],
                        ),
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                      Text(
                        'or continue with',
                        style: TextStyle(color: Colors.grey[700]),
                      ),
                      const SizedBox(
                        width: 10,
                      ),
                      Expanded(
                        child: Divider(
                          thickness: 0.5,
                          color: Colors.grey[400],
                        ),
                      ),
                    ],
                  ),
                ),
                // google and facebook button

                const SizedBox(
                  height: 50,
                ),

                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // google button
                    SquareTile(
                      imagePath: 'lib/assets/images/google.png',
                    ),
                    SizedBox(
                      width: 25,
                    ),

                    // facebook button
                    SquareTile(
                      imagePath: 'lib/assets/images/facebook.png',
                    ),
                  ],
                ),

                const SizedBox(
                  height: 50,
                ),

                // not a member? register

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Not a member?'),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () {
                        Get.toNamed('/register');
                      },
                      child: const Text(
                        'Register now',
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
