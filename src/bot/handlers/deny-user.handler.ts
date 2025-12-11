import { Context } from '../interfaces/context.interface';

export class DenyUserHandler {
  async handleDenyUser(ctx: Context) {
    // Foydalanuvchiga ruxsat bermaslik
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const callbackData = ctx.callbackQuery.data;
    const [, userId] = callbackData.split('_');

    // Xabarni yangilash - foydalanuvchiga ruxsat berilmaganligini ko'rsatish
    const message = ctx.callbackQuery.message;
    if (message && 'text' in message) {
      const updatedText = `${message.text}\n\n❌ *Foydalanuvchiga ruxsat berilmadi*`;
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
        "😔 Sizga yetkazib berish uchun ruxsat berilmadi. Iltimos, keyinroq qayta urinib ko'ring.",
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      console.error('Error sending message to user:', error);
    }

    // Callback query ga javob berish
    await ctx.answerCbQuery('Foydalanuvchiga ruxsat berilmadi!');
  }
}
