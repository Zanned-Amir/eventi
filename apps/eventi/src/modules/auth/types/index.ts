export class UserToken {
  user_id: number;
  token: string;
  type: string;
  is_in_blacklist: boolean = false;
  expires_at: Date;
  device_info: string;
}
