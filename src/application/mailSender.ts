import { Injectable } from '@nestjs/common';
import { MailAdapter } from './adapters/mail.adapter';

@Injectable()
export class MailSender2 {
  constructor(private mailAdapter: MailAdapter) {}
  async sendRegistrationMail1(to: string, code: string): Promise<boolean> {
    return this.mailAdapter.sendGmail({
      to,
      title: 'Auth',
      subject: 'confirm registration',
      html: `<h1>Thank for your registration</h1><p>To finish registration please follow the link below: <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a></p>`,
    });
  }
  async sendPasswordRecoveryMail1(to: string, code: string): Promise<boolean> {
    return this.mailAdapter.sendGmail({
      to,
      title: 'Auth',
      subject: 'confirm registration',
      html: `<h1>Password recovery</h1><p>To finish password recovery please follow the link below:<a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a></p>`,
    });
  }
}
