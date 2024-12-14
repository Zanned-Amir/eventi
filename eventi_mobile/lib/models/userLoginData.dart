class UserLoginData {
  final int userId;
  final String username;
  final String? password;
  final String email;
  final bool isConfirmed;
  final String accountStatus;
  final DateTime? lastLoginTimestamp;
  final DateTime? lastActivityTimestamp;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserLoginData({
    required this.userId,
    required this.username,
    required this.password,
    required this.email,
    required this.isConfirmed,
    required this.accountStatus,
    this.lastLoginTimestamp,
    this.lastActivityTimestamp,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserLoginData.fromJson(Map<String, dynamic> json) {
    return UserLoginData(
      userId: json['user_id'],
      username: json['username'],
      password: json['password'],
      email: json['email'],
      isConfirmed: json['is_confirmed'],
      accountStatus: json['account_status'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'username': username,
      'password': password,
      'email': email,
      'is_confirmed': isConfirmed,
      'account_status': accountStatus,
      'last_login_timestamp': lastLoginTimestamp,
      'last_activity_timestamp': lastActivityTimestamp,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
