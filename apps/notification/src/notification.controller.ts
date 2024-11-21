import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailerService } from './mailer/mailer.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly mailerService: MailerService,
  ) {}

  @EventPattern('welcome_email')
  async handleWelcomeEmail(data: any) {
    console.log('Welcome Email', data);
    return this.mailerService.sendWelcomeEmail(data);
  }

  @EventPattern('reset_password_email')
  async handleResetPasswordEmail(data: any) {
    return this.mailerService.sendResetPasswordEmail(data);
  }

  @EventPattern('reset_password_email_changed')
  async handleResetPasswordEmailChanged(data: any) {
    return this.mailerService.sendPasswordChangedEmail(data);
  }

  //email confirmation
  @EventPattern('confirm_email')
  async handleConfirmEmail(data: any) {
    return this.mailerService.sendConfirmEmail(data);
  }

  @EventPattern('email_confirmed')
  async handleEmailConfirmed(data: any) {
    return this.mailerService.sendEmailConfirmed(data);
  }

  @EventPattern('order_test')
  async handleTestEmail(data: any) {
    console.log('Test Email', data);
  }

  @EventPattern('order_invoice_email')
  async handleOrderInvoiceEmail(data: any) {
    return this.mailerService.sendInvoiceEmail(data);
  }

  @EventPattern('order_ticket_email')
  async handleOrderTicketEmail(data: any) {
    console.log('Ticket Email', data);
    return this.mailerService.sendTicketEmail(data);
  }

  @EventPattern('send_role_badge_email')
  async handleRoleBadgeEmail(data: any) {
    return this.mailerService.sendRoleBadgetEmail(data);
  }
}
