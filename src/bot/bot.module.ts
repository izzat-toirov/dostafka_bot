import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';
import { CompanyInfoService } from './services/company-info.service';
import { BackHandler } from './handlers/back.handler';
import { TextHandler } from './handlers/text.handler';
import { ContactHandler } from './handlers/contact.handler';
import { LocationHandler } from './handlers/location.handler';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';

// Bot moduli - Telegram bot uchun asosiy modul
@Module({
  imports: [UsersModule, OrdersModule],
  // Bot uchun kerakli servis va yangilanishlarni ro'yxatga olish
  providers: [
    BotUpdate,
    DeliveryService,
    OrderService,
    CompanyInfoService,
    BackHandler,
    TextHandler,
    ContactHandler,
    LocationHandler,
  ],
})
export class BotModule {}
