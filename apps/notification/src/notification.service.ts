import { Injectable } from '@nestjs/common';
import { MailerService } from './mailer/mailer.service';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}
}
