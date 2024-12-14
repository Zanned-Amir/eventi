class Permission {
  final int permissionId;
  final String permissionName;
  final String permissionDescription;

  Permission({
    required this.permissionId,
    required this.permissionName,
    required this.permissionDescription,
  });

  factory Permission.fromJson(Map<String, dynamic> json) {
    return Permission(
      permissionId: json['permission_id'],
      permissionName: json['permission_name'],
      permissionDescription: json['permission_description'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'permission_id': permissionId,
      'permission_name': permissionName,
      'permission_description': permissionDescription,
    };
  }
}

enum Permissions {
  MANAGE_USERS,
  MANAGE_EVENTS,
  MANAGE_TICKETS,
  VIEW_REPORTS,
  ISSUE_REFUNDS,
  VIEW_ALL_RESERVATIONS,
  CREATE_EVENTS,
  EDIT_EVENTS,
  VIEW_EVENTS,
  DELETE_EVENTS,
  VIEW_EVENT_RESERVATIONS,
  MANAGE_VENDOR_BOOTHS,
  VIEW_VENDOR_SALES_REPORTS,
}
