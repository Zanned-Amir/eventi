import 'package:intl/intl.dart';

Map<String, String> convertToStringMapWithDateCheck(
    Map<String, dynamic> inputMap) {
  return inputMap.map((key, value) {
    if (value is String) {
      // Check if the string is in DateTime format
      try {
        final parsedDate = DateTime.parse(value);
        // Format the DateTime into a readable format (e.g., "17 Nov 2024 15:30")
        final formattedDate =
            DateFormat('dd MMM yyyy HH:mm').format(parsedDate);
        return MapEntry(key, formattedDate);
      } catch (e) {
        // If not a valid DateTime, return the value as-is
        return MapEntry(key, value);
      }
    } else {
      // Convert all other values to strings
      return MapEntry(key, value?.toString() ?? '');
    }
  });
}

void whitelistKeyMap(Map<String, dynamic> inputMap, List<String> whitelist) {
  inputMap.removeWhere((key, value) => !whitelist.contains(key));
}
