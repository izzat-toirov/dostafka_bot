import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';

@Module({
  providers: [BotUpdate, DeliveryService, OrderService],
})
export class BotModule {}
