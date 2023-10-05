import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { appConfig } from '../utils/config';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import path from 'node:path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

export type MailSenderData = {
  title: string;
  subject: string;
  to: string;
  html: string;
};

@Injectable()
export abstract class AbstractMailSender {
  protected transporter: nodemailer.Transporter;

  protected constructor() {
    this.transporter = this.configTransporter();
  }

  abstract configTransporter(): nodemailer.Transporter;

  protected async sendMail(data: MailSenderData): Promise<boolean> {
    if (!this.isValidConfig(data)) {
      throw Error('GMailSender');
    }

    try {
      const mail: Mail.Options = {
        from: this.createFromTitle(data.title),
        to: data.to,
        html: data.html,
        subject: data.subject,
      };

      const result: SMTPTransport.SentMessageInfo = await this.transporter.sendMail(mail);

      console.log({ emailResult: result });

      return result.accepted.includes(data.to);
    } catch (e: any) {
      console.log(`MailSender error: ${e}`);
      return false;
    }
  }

  protected createFromTitle(title: string) {
    return `${title} <${appConfig.gmailAdapterUser}>`;
  }

  protected loadTemplate(templateName: string): handlebars.TemplateDelegate {
    const templatesFolderPath = path.join(__dirname, './templates');
    const templatePath = path.join(templatesFolderPath, templateName);

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  }

  protected isValidConfig({ title, subject, to, html }: MailSenderData): boolean {
    const isTitleValid: boolean = Boolean(title) && title.length > 0;
    const isSubjectValid: boolean = Boolean(subject) && subject.length > 0;
    const isToValid: boolean = Boolean(to) && to.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
    const isHtmlValid: boolean = Boolean(html) && html.length > 0;
    return isTitleValid && isSubjectValid && isToValid && isHtmlValid;
  }
}
