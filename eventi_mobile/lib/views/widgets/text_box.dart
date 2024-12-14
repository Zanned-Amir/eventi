import 'package:flutter/material.dart';

class MyTextBox extends StatelessWidget {
  final String text;
  final String sectionName;
  final void Function()? onPressed;
  final bool isEditable;

  // Customizable styles
  final TextStyle? sectionNameStyle;
  final TextStyle? textStyle;
  final Color? backgroundColor;
  final Color? iconColor;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  const MyTextBox({
    super.key,
    required this.text,
    required this.sectionName,
    this.onPressed,
    this.isEditable = true,
    this.sectionNameStyle,
    this.textStyle,
    this.backgroundColor = const Color(0xFFF5F5F5), // Default light grey
    this.iconColor = const Color(0xFFBDBDBD), // Default grey
    this.borderRadius = 8.0,
    this.padding = const EdgeInsets.only(left: 15, bottom: 15),
    this.margin = const EdgeInsets.only(left: 20, right: 20, top: 20),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      padding: padding,
      margin: margin,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section name and edit button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Padding(
                padding: isEditable
                    ? const EdgeInsets.only(top: 0)
                    : const EdgeInsets.only(top: 14, bottom: 14),
                child: Text(
                  sectionName,
                  style: sectionNameStyle ??
                      TextStyle(color: Colors.grey[500], fontSize: 14),
                ),
              ),
              if (isEditable)
                IconButton(
                  onPressed: onPressed,
                  icon: Icon(
                    Icons.settings,
                    color: iconColor,
                  ),
                ),
            ],
          ),

          // Text content
          Text(
            text,
            style:
                textStyle ?? const TextStyle(fontSize: 16, color: Colors.black),
          ),
        ],
      ),
    );
  }
}
