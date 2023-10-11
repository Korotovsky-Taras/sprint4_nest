import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { AbstractMailSender } from './AbstractMailSender';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GMailSender extends AbstractMailSender {
  private readonly passwordConfirmationTmpl: handlebars.TemplateDelegate;
  private readonly registrationConfirmationTmpl: handlebars.TemplateDelegate;

  constructor(private readonly configService: ConfigService) {
    super();
    this.passwordConfirmationTmpl = this.loadTemplate('passwordConfirmation.hbs');
    this.registrationConfirmationTmpl = this.loadTemplate('registrationConfirmation.hbs');
  }

  getTransporter(): nodemailer.Transporter {
    const user = this.configService.get<string>('gmail.EMAIL');
    const pass = this.configService.get<string>('gmail.PASSWORD');
    return nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 25, //?
      tls: {
        rejectUnauthorized: false,
      },
      auth: { user, pass },
    });
  }

  protected createFromTitle(title: string) {
    const email = this.configService.get<string>('gmail.EMAIL');
    return `${title} <${email}>`;
  }

  async sendRegistrationMail(to: string, code: string): Promise<boolean> {
    const client_url = this.configService.get<string>('gmail.CLIENT_URL');
    const url = `${client_url}?code=${code}`;
    const html = this.registrationConfirmationTmpl({ url });
    return this.sendMail({
      to,
      title: this.createFromTitle('Registration'),
      subject: 'confirm registration',
      html,
    });
  }

  async sendPasswordRecoveryMail(to: string, code: string): Promise<boolean> {
    const client_url = this.configService.get<string>('gmail.CLIENT_URL');
    const url = `${client_url}?recoveryCode=${code}`;
    const html = this.passwordConfirmationTmpl({ url });
    return this.sendMail({
      to,
      title: this.createFromTitle('Recovery Password'),
      subject: 'confirm registration',
      html,
    });
  }
}
