import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { appConfig } from '../utils/config';
import * as handlebars from 'handlebars';
import { AbstractMailSender } from './AbstractMailSender';

@Injectable()
export class GMailSender extends AbstractMailSender {
  private readonly passwordConfirmationTmpl: handlebars.TemplateDelegate;
  private readonly registrationConfirmationTmpl: handlebars.TemplateDelegate;

  constructor() {
    super();

    this.passwordConfirmationTmpl = this.loadTemplate('passwordConfirmation.hbs');
    this.registrationConfirmationTmpl = this.loadTemplate('registrationConfirmation.hbs');
  }

  configTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      secure: true,
      auth: { user: appConfig.gmailAdapterUser, pass: appConfig.gmailAdapterPass },
    });
  }

  async sendRegistrationMail(to: string, code: string): Promise<boolean> {
    const url = `${appConfig.gmailClientUrl}?code=${code}`;
    const html = this.registrationConfirmationTmpl({ url });
    return this.sendGmail({
      to,
      title: 'Auth',
      subject: 'confirm registration',
      html,
    });
  }

  async sendPasswordRecoveryMail(to: string, code: string): Promise<boolean> {
    const url = `${appConfig.gmailClientUrl}?recoveryCode=${code}`;
    const html = this.passwordConfirmationTmpl({ url });
    return this.sendGmail({
      to,
      title: 'Auth',
      subject: 'confirm registration',
      html,
    });
  }
}
