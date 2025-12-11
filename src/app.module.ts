import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import LocalSession from 'telegraf-session-local';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';

// Lokal sessiya konfiguratsiyasi
const localSession = new LocalSession({ database: 'sessions.json' });

// Asosiy ilova moduli
@Module({
  // Kerakli modullarni import qilish
  imports: [
    // Konfiguratsiya moduli (global qilingan)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Database module
    DatabaseModule,
    // Users module
    UsersModule,
    // Orders module
    OrdersModule,
    // Telegraf moduli (Telegram bot uchun)
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN || '',
      middlewares: [localSession.middleware()],
    }),
    // Bot moduli
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
