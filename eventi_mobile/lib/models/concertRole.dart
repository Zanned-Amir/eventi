import 'package:eventi_mobile/models/concert.dart';
import 'package:eventi_mobile/models/concertMember.dart';
import 'package:eventi_mobile/models/role.dart';

class ConcertRole {
  int? concertRoleId;
  int? concertMemberId;
  String? accessCode;
  int? concertId;
  int? roleId;

  Concert? concert;
  Role? role;
  ConcertMember? concertMember;

  ConcertRole({
    this.concertRoleId,
    this.concertMemberId,
    this.accessCode,
    this.concertId,
    this.roleId,
    this.concert,
    this.role,
    this.concertMember,
  });

  factory ConcertRole.fromJson(Map<String, dynamic> json) => ConcertRole(
        concertRoleId: json['concert_role_id'],
        concertMemberId: json['concert_member_id'],
        accessCode: json['access_code'],
        concertId: json['concert_id'],
        roleId: json['role_id'],
        concert:
            json['concert'] != null ? Concert.fromJson(json['concert']) : null,
        role: json['role'] != null ? Role.fromJson(json['role']) : null,
        concertMember: json['concertMember'] != null
            ? ConcertMember.fromJson(json['concertMember'])
            : null,
      );

  Map<String, dynamic> toJson() => {
        'concert_role_id': concertRoleId,
        'concert_member_id': concertMemberId,
        'access_code': accessCode,
        'concert_id': concertId,
        'role_id': roleId,
        'concert': concert?.toJson(),
        'role': role?.toJson(),
        'concertMember': concertMember?.toJson(),
      };

  void updateFromJson(Map<String, dynamic> json) {
    concertRoleId = json['concert_role_id'];
    concertMemberId = json['concert_member_id'];
    accessCode = json['access_code'];
    concertId = json['concert_id'];
    roleId = json['role_id'];

    concert =
        json['concert'] != null ? Concert.fromJson(json['concert']) : null;
    role = json['role'] != null ? Role.fromJson(json['role']) : null;
    concertMember = json['concertMember'] != null
        ? ConcertMember.fromJson(json['concertMember'])
        : null;
  }
}
