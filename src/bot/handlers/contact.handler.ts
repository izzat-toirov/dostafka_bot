import { Context } from '../interfaces/context.interface';
import { OrderHandler } from './order.handler';
import { RegistrationHandler } from './registration.handler';
import { OrderService } from '../services/order.service';
import { OrdersService } from '../../orders/orders.service';

export class ContactHandler {
  private readonly registrationHandler: RegistrationHandler;
  private readonly orderHandler: OrderHandler;

  constructor(orderService: OrderService, ordersService: OrdersService) {
    this.registrationHandler = new RegistrationHandler(orderService);
    this.orderHandler = new OrderHandler(orderService, ordersService);
  }

  // Kontakt ma'lumotlarini qabul qilish
  async handleUserContact(ctx: Context) {
    if (!ctx.message || !('contact' in ctx.message)) return;

    const state = ctx.session?.state;

    if (state === 'waiting_phone_contact') {
      await this.registrationHandler.handlePhoneContact(ctx);
    } else if (state === 'waiting_phone') {
      await this.orderHandler.handlePhone(ctx);
    }
  }
}
