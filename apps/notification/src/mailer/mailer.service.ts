import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configService: ConfigService) {}

  private mailTransporter() {
    return nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('MAIL_HOST'),
      port: this.configService.getOrThrow<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('MAIL_USER'),
        pass: this.configService.getOrThrow<string>('MAIL_PASSWORD'),
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
      from: this.configService.getOrThrow<string>('MAIL_USER'),
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

  async sendOrderCreatedEmail(data: any) {
    console.log('Order Created Email', data);
  }

  async sendOrderShippedEmail(data: any) {
    console.log('Order Shipped Email', data);
  }
}
