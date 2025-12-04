import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';
import { CompanyInfoService } from './services/company-info.service';

@Module({
  providers: [BotUpdate, DeliveryService, OrderService, CompanyInfoService],
})
export class BotModule {}
