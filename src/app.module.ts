import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { session } from 'telegraf';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN || '',
      middlewares: [session()],
    }),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
