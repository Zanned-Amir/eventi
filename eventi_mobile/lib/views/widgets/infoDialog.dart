import 'package:eventi_mobile/views/widgets/text_box.dart';
import 'package:flutter/material.dart';
import 'package:recase/recase.dart';

class InfoDialog extends StatelessWidget {
  final Map<String, dynamic> infoMap;

  const InfoDialog({super.key, required this.infoMap});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green[400],
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.info, size: 100),
            Flexible(
              // Use Flexible to allow ListView to take available space
              child: ListView.builder(
                shrinkWrap: true, // Prevents infinite height error
                itemCount: infoMap.length,
                itemBuilder: (BuildContext context, int index) {
                  return MyTextBox(
                    sectionName:
                        ReCase(infoMap.keys.elementAt(index)).camelCase,
                    text: infoMap.values.elementAt(index).toString(),
                    sectionNameStyle: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                    textStyle: const TextStyle(
                      fontSize: 16,
                      color: Color.fromARGB(255, 69, 7, 255),
                    ),
                    onPressed: () {},
                    isEditable: false,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
