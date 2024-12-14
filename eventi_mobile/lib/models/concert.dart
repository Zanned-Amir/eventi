class Concert {
  int? concertId;
  int? venueId;
  int? concertGroupId;
  DateTime? concertAvailableFrom;
  DateTime? concertStartDate;
  DateTime? concertEndDate;
  String? concertName;
  bool? isActive;

  Concert({
    this.concertId,
    this.venueId,
    this.concertGroupId,
    this.concertAvailableFrom,
    this.concertStartDate,
    this.concertEndDate,
    this.concertName,
    this.isActive,
  });

  factory Concert.fromJson(Map<String, dynamic> json) => Concert(
        concertId: json['concert_id'],
        venueId: json['venue_id'],
        concertGroupId: json['concert_group_id'],
        concertAvailableFrom: json['concert_available_from'] != null
            ? DateTime.parse(json['concert_available_from'])
            : null,
        concertStartDate: json['concert_start_date'] != null
            ? DateTime.parse(json['concert_start_date'])
            : null,
        concertEndDate: json['concert_end_date'] != null
            ? DateTime.parse(json['concert_end_date'])
            : null,
        concertName: json['concert_name'],
        isActive: json['is_active'],
      );

  Map<String, dynamic> toJson() => {
        'concert_id': concertId,
        'venue_id': venueId,
        'concert_group_id': concertGroupId,
        'concert_available_from': concertAvailableFrom?.toIso8601String(),
        'concert_start_date': concertStartDate?.toIso8601String(),
        'concert_end_date': concertEndDate?.toIso8601String(),
        'concert_name': concertName,
        'is_active': isActive,
      };
}
