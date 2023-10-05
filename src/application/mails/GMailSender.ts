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
    super(
      nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, //?
        tls: {
          rejectUnauthorized: false,
        },
        auth: { user: appConfig.gmailAdapterUser, pass: appConfig.gmailAdapterPass },
      }),
    );
    this.passwordConfirmationTmpl = this.loadTemplate('passwordConfirmation.hbs');
    this.registrationConfirmationTmpl = this.loadTemplate('registrationConfirmation.hbs');
  }

  async sendRegistrationMail(to: string, code: string): Promise<boolean> {
    const url = `${appConfig.gmailClientUrl}?code=${code}`;
    const html = this.registrationConfirmationTmpl({ url });
    return this.sendMail({
      to,
      title: 'Auth',
      subject: 'confirm registration',
      html,
    });
  }

  async sendPasswordRecoveryMail(to: string, code: string): Promise<boolean> {
    const url = `${appConfig.gmailClientUrl}?recoveryCode=${code}`;
    const html = this.passwordConfirmationTmpl({ url });
    return this.sendMail({
      to,
      title: 'Auth',
      subject: 'confirm registration',
      html,
    });
  }
}
