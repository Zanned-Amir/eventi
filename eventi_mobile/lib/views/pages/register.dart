import 'package:eventi_mobile/controllers/register_controller.dart';
import 'package:eventi_mobile/views/widgets/my_button.dart';
import 'package:eventi_mobile/views/widgets/my_textfiled.dart';
import 'package:eventi_mobile/views/widgets/square_tile.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_navigation/get_navigation.dart';

class Register extends StatelessWidget {
  Register({Key? key}) : super(key: key);

  final RegisterController controller = Get.put(RegisterController());

  // text editing controller
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
      ),
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
                Text('let\'s create an account for you!',
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
                    controller: controller.emailController),

                const SizedBox(
                  height: 10,
                ),

                // username textfield

                MyTextFiled(
                  hintText: 'Username',
                  obscureText: false,
                  controller: controller.usernameController,
                ),

                const SizedBox(
                  height: 10,
                ),

                //password textfield

                MyTextFiled(
                  hintText: 'Password',
                  obscureText: true,
                  controller: controller.passwordController,
                ),

                const SizedBox(
                  height: 10,
                ),

                // confirm password textfield

                MyTextFiled(
                  hintText: 'Confirm Password',
                  obscureText: true,
                  controller: controller.confirmPasswordController,
                ),

                const SizedBox(
                  height: 25,
                ),

                // register button

                MyButton(
                  onTap: controller.checkRegisterPageOne,
                  text: "Sign Up",
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
                  height: 30,
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
                    const Text(' Already have an account?'),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () {
                        Get.offNamed('/login');
                      },
                      child: const Text(
                        'Login now',
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(
                  height: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
