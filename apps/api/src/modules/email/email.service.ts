import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend?: Resend;
  private from: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('resend.apiKey');
    this.from = this.configService.get<string>('resend.from', 'noreply@brightloop.local');

    if (apiKey && apiKey !== 're_placeholder') {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (this.resend) {
      try {
        const data = await this.resend.emails.send({
          from: this.from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email dispatched via Resend to ${to}: ${subject}`);
        return data;
      } catch (error) {
        this.logger.error(`Resend dispatch error: ${(error as Error).message}`);
      }
    }

    // Dev Fallback Logger
    this.logger.log(`[DEV EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  async sendVerificationEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>(
      'frontendUrl',
      'http://localhost:5173',
    );
    const link = `${frontendUrl}/verify-email?token=${token}`;
    return this.sendEmail(
      to,
      'Verify your email address - Brightloop',
      `<p>Welcome! Click <a href="${link}">here</a> to verify your account.</p>`,
    );
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>(
      'frontendUrl',
      'http://localhost:5173',
    );
    const link = `${frontendUrl}/reset-password?token=${token}`;
    return this.sendEmail(
      to,
      'Reset your password - Brightloop',
      `<p>You requested a password reset. Click <a href="${link}">here</a> to choose a new password.</p>`,
    );
  }
}
