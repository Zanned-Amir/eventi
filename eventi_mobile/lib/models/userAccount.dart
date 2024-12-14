import 'package:eventi_mobile/models/userLoginData.dart';
import 'package:eventi_mobile/models/userRole.dart';

class UserAccount {
  final int userId;
  final int roleId;
  final String firstName;
  final String lastName;
  final String gender;
  final DateTime birthDate;
  final DateTime createdAt;
  final DateTime updatedAt;
  final UserLoginData? userLoginData;
  final UserRole? role;

  UserAccount({
    required this.userId,
    required this.roleId,
    required this.firstName,
    required this.lastName,
    required this.gender,
    required this.birthDate,
    required this.createdAt,
    required this.updatedAt,
    this.userLoginData,
    this.role,
  });

  factory UserAccount.fromJson(Map<String, dynamic> json) {
    return UserAccount(
        userId: json['user_id'],
        roleId: json['role_id'],
        firstName: json['first_name'],
        lastName: json['last_name'],
        gender: json['gender'],
        birthDate: DateTime.parse(json['birth_date']),
        createdAt: DateTime.parse(json['created_at']),
        updatedAt: DateTime.parse(json['updated_at']),
        userLoginData: json['userLoginData'] != null
            ? UserLoginData.fromJson(json['userLoginData'])
            : null,
        role: json['role'] != null ? UserRole.fromJson(json['role']) : null);
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'role_id': roleId,
      'first_name': firstName,
      'last_name': lastName,
      'gender': gender,
      'birth_date': birthDate.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'userLoginData': userLoginData?.toJson(),
    };
  }
}
