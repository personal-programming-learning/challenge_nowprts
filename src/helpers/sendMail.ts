import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';


export class SendMail{

  private smtpTransport: any;
  private emailTemplateProvider: any;
  private template: any;

  constructor(template: string) {
    this.template = template;
    this.smtpTransport = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        },
    });
    
    this.emailTemplateProvider = fs.readFileSync(path.join(__dirname, `../templates/${this.template}.hbs`), "utf8");
    
  }

  public setTemplate(template: string){
    this.template = template
  }

  /**
   * Send email
   */
  public send(values: any, subject: string ,file?: any){
    return new Promise(async(resolve, reject) =>{
      const handleTemplate = handlebars.compile(this.emailTemplateProvider)
      const htmlToSend = handleTemplate(values);
      const mailOptions: any = {
        to: values.to ? values.email : process.env.USER_EMAIL_SEND,
        from: process.env.USER_EMAIL_SEND,
        subject: subject,
        html: htmlToSend,
        attachments: values.filename && [
          {
            filename: values.filename,
            content: file
          }
        ]
      }

      this.smtpTransport.sendMail(mailOptions, (error: any, response: any) =>{
        if(error) {
          reject(error)
          console.error(error);
        }else{
          console.log('message', 'Successfully sent email.')
          resolve({ status: true, message: 'Successfully sent email.' })
        }
      });

    });
  }

}