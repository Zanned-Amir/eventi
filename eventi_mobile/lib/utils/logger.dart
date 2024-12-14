import 'package:logger/logger.dart';

class MyLogger {
  static var logger = Logger(
    level: Level.debug, // Default level for logging
    printer: PrettyPrinter(methodCount: 2), // Formats log messages
  );

  static void logInfo(String message) {
    logger.i(message); // Log info
  }

  static void logWarning(String message) {
    logger.w(message); // Log warning
  }

  static void logError(String message) {
    logger.e(message); // Log error
  }
}
