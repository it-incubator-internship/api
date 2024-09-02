import { join } from 'path';

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

import { ConfigurationType } from '../../common/settings/configuration';

import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        const emailSettings = configService.get('mailSettings', { infer: true });
        return {
          transport: {
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
              user: emailSettings.email,
              pass: emailSettings.password,
            },
          },
          defaults: {
            from: 'navaibe.ru <linesgreenTest@gmail.com>',
          },
          template: {
            dir: join(__dirname, 'providers', 'mailer', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
