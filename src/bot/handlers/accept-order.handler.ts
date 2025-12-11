import { Context } from '../interfaces/context.interface';
import { UsersService } from '../../users/users.service';
import { OrderService } from '../services/order.service';
import { OrdersService } from '../../orders/orders.service';
import { OrderStatus } from '../../orders/entities/order.entity';

export class AcceptOrderHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly orderService: OrderService,
    private readonly ordersService: OrdersService,
  ) {}

  async handleAcceptOrder(ctx: Context) {
    // Buyurtmani qabul qilish
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const callbackData = ctx.callbackQuery.data;
    const parts = callbackData.split('_');
    const orderId = parts[1];
    const userId = parts[2];
    const latitude = parts[3];
    const longitude = parts[4];

    // Xabarni yangilash - buyurtma qabul qilinganligini ko'rsatish
    const message = ctx.callbackQuery.message;
    if (message && 'text' in message) {
      const updatedText = `${message.text}\n\n✅ *Buyurtma qabul qilindi!*`;
      await ctx.telegram.editMessageText(
        message.chat.id,
        message.message_id,
        undefined,
        updatedText,
        { parse_mode: 'Markdown' },
      );
    }

    // Buyurtma holatini yangilash - confirmed (active: true)
    try {
      // orderId ni BigInt sifatida konvert qilish
      const orderIdBigInt = BigInt(orderId);

      // Buyurtmani yangilash
      await this.ordersService.updateOrderStatus(
        parseInt(orderId),
        OrderStatus.CONFIRMED,
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }

    // Guruh ID ni olish
    const groupId = process.env.ORDERS_GROUP_ID;
    if (groupId) {
      // Foydalanuvchi ma'lumotlarini olish
      const user = await this.usersService.findByTelegramId(parseInt(userId));
      if (user) {
        // Foydalanuvchi ma'lumotlarini guruhga yuborish
        await this.orderService.sendUserInfoToGroup(
          {
            name: user.name,
            phone: user.phone,
            userId: userId,
            latitude: latitude,
            longitude: longitude,
          },
          groupId,
        );
      }
    }

    // Callback query ga javob berish
    await ctx.answerCbQuery('Buyurtma qabul qilindi!');
  }
}
