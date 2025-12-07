import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import LocalSession from 'telegraf-session-local';

const localSession = new LocalSession({ database: 'sessions.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN || '',
      middlewares: [localSession.middleware()],
    }),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
