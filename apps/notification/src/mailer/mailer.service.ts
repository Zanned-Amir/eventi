import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private isProduction: boolean;
  constructor(private readonly configService: ConfigService) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  private mailTransporter() {
    return nodemailer.createTransport({
      host: this.isProduction
        ? this.configService.getOrThrow<string>('MAIL_HOST_PROD')
        : this.configService.getOrThrow<string>('MAIL_HOST'),
      port: this.isProduction
        ? this.configService.getOrThrow<number>('MAIL_PORT_PROD')
        : this.configService.getOrThrow<number>('MAIL_PORT'),
      secure: this.configService.getOrThrow<string>('MAIL_PORT') === '465',
      // Use TLS in production
      auth: {
        user: this.isProduction
          ? this.configService.getOrThrow<string>('MAIL_USER_PROD')
          : this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.isProduction
          ? this.configService.getOrThrow<string>('MAIL_PASSWORD_PROD')
          : this.configService.getOrThrow<string>('MAIL_PASSWORD'),
      },
    });
  }

  private async renderTemplate(templateName: string, data: any) {
    const templatePath = path.join(
      process.cwd(),
      './apps/notification/src/mailer/templates',
      templateName,
    );

    const template = await fs.readFile(templatePath, 'utf-8');
    return ejs.render(template, data);
  }

  async sendMail(template: string, to: string, subject: string, context: any) {
    this.logger.log('Sending email to ' + to);
    const transporter = this.mailTransporter();

    const html = await this.renderTemplate(template, context);

    const mailOptions = {
      from: this.isProduction
        ? this.configService.getOrThrow<string>('MAIL_SENDER_PROD')
        : this.configService.getOrThrow<string>('MAIL_USER'),
      to,
      subject,
      html,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error(`Error sending email to ${to}: ${error.message}`);
        throw new Error('Error sending email');
      }
      this.logger.log(`Email sent to ${to}: ${info.response}`);
      return info;
    });
  }

  async sendWelcomeEmail(data: any) {
    await this.sendMail('welcome.ejs', data.email, 'Welcome to our platform', {
      name: data.name,
    });
  }

  async sendResetPasswordEmail(data: any) {
    await this.sendMail(
      'resetPassword.ejs',
      data.email,
      'Reset your password',
      {
        name: data.name,
        resetLink: data.resetLink,
      },
    );
  }

  async sendPasswordChangedEmail(data: any) {
    await this.sendMail('passwordChanged.ejs', data.email, 'Password changed', {
      email: data.email,
    });
  }

  async sendConfirmEmail(data: any) {
    await this.sendMail(
      'emailConfirmation.ejs',
      data.email,
      'Confirm your email',
      {
        name: data.name,
        confirmationLink: data.confirmationLink,
        email: data.email,
      },
    );
  }

  async sendEmailConfirmed(data: any) {
    await this.sendMail('emailConfirmed.ejs', data.email, 'Email confirmed', {
      email: data.email,
    });
  }

  async sendInvoiceEmail(data: any) {
    await this.sendMail('invoice.ejs', data.email, 'Invoice', {
      logoURL: '', // URL to the logo
      customerName: data.customerName, // Customer's name
      orderNumber: data.orderNumber, // Order number
      orderDate: data.orderDate, // Order date
      items: data.items, // Array of item objects
      subtotal: data.subtotal, // Subtotal amount
      grandTotal: data.grandTotal, // Grand total amount
      tax: data.tax, // Tax amount
      paymentMethod: data.paymentMethod, // Payment method object
    });
  }

  async sendTicketEmail(data: any) {
    await this.sendMail('ticket.ejs', data.email, 'Ticket', {
      tickets: data.tickets, // Array of ticket objects
      poweredBy: data.poweredBy, // Powered by text
    });
  }

  async sendRoleBadgetEmail(data: any) {
    await this.sendMail('roleBadge.ejs', data.email, 'Role Badge', {
      full_name: data.full_name,
      role_name: data.role_name,
      concert_name: data.concert_name,
      concert_start_date: data.concert_start_date,
      concert_end_date: data.concert_end_date,
      access_code_qr: data.access_code_qr,
    });
  }

  async sendOtpEmail(data: any) {
    await this.sendMail('otp.ejs', data.email, 'OTP', {
      otp: data.otp,
    });
  }
}
