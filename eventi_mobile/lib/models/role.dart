class Role {
  int? roleId;
  String roleName;
  String? description;

  Role({
    this.roleId,
    this.roleName = 'Unknown',
    this.description,
  });

  factory Role.fromJson(Map<String, dynamic> json) => Role(
        roleId: json['role_id'],
        roleName: json['role_name'],
        description: json['description'],
      );

  Map<String, dynamic> toJson() => {
        'role_id': roleId,
        'role_name': roleName,
        'description': description,
      };
}
