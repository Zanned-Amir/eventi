class UserRole {
  final int roleId;
  final String roleName;
  final String roleDescription;

  UserRole({
    required this.roleId,
    required this.roleName,
    required this.roleDescription,
  });

  factory UserRole.fromJson(Map<String, dynamic> json) {
    return UserRole(
      roleId: json['role_id'],
      roleName: json['role_name'],
      roleDescription: json['role_description'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role_id': roleId,
      'role_name': roleName,
      'role_description': roleDescription,
    };
  }
}

enum Role {
  ADMIN,
  EVENT_ORGANIZER,
  SUPPORT_STAFF,
  USER,
  GUEST,
  TICKET_VENDOR,
  VENDOR,
  TICKET_VERIFIER,
}
