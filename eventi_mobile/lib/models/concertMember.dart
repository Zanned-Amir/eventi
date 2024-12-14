class ConcertMember {
  int? concertMemberId;
  String? fullName;
  String? email;
  String? phoneNumber;

  ConcertMember({
    this.concertMemberId,
    this.fullName,
    this.email,
    this.phoneNumber,
  });

  factory ConcertMember.fromJson(Map<String, dynamic> json) => ConcertMember(
        concertMemberId: json['concert_member_id'],
        fullName: json['full_name'],
        email: json['email'],
        phoneNumber: json['phone_number'],
      );

  Map<String, dynamic> toJson() => {
        'concert_member_id': concertMemberId,
        'full_name': fullName,
        'email': email,
        'phone_number': phoneNumber,
      };
}
