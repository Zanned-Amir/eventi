export function generateTicketCode(
  concert_id: number,
  ticket_category_id: number,
): string {
  const concertIdStr = concert_id.toString().padStart(4, '0'); // Ensure concert ID is 4 digits
  const categoryIdStr = ticket_category_id.toString().padStart(2, '0'); // Ensure category ID is 2 digits
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random alphanumeric string
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp

  return `${concertIdStr}-${categoryIdStr}-${randomStr}-${timestamp}`;
}
