import { Context } from '../interfaces/context.interface';

export class RejectOrderHandler {
  async handleRejectOrder(ctx: Context) {
    // Buyurtmani rad etish
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const callbackData = ctx.callbackQuery.data;
    const [, orderId, userId] = callbackData.split('_');

    // Xabarni yangilash - buyurtma rad etilganligini ko'rsatish
    const message = ctx.callbackQuery.message;
    if (message && 'text' in message) {
      const updatedText = `${message.text}\n\n❌ *Buyurtma rad etildi*`;
      await ctx.telegram.editMessageText(
        message.chat.id,
        message.message_id,
        undefined,
        updatedText,
        { parse_mode: 'Markdown' },
      );
    }

    // Foydalanuvchiga xabar yuborish
    try {
      await ctx.telegram.sendMessage(
        parseInt(userId),
        "😔 Sizning buyurtmangiz rad etildi. Iltimos, keyinroq qayta urinib ko'ring.",
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      console.error('Error sending message to user:', error);
    }

    // Callback query ga javob berish
    await ctx.answerCbQuery('Buyurtma rad etildi!');
  }
}
