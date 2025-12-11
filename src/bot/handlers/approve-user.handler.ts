import { Context } from '../interfaces/context.interface';

export class ApproveUserHandler {
  async handleApproveUser(ctx: Context) {
    // Foydalanuvchiga ruxsat berish
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const callbackData = ctx.callbackQuery.data;
    const [, userId] = callbackData.split('_');

    // Xabarni yangilash - foydalanuvchiga ruxsat berilganligini ko'rsatish
    const message = ctx.callbackQuery.message;
    if (message && 'text' in message) {
      const updatedText = `${message.text}\n\n✅ *Foydalanuvchiga ruxsat berildi!*`;
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
        "🎉 Sizning buyurtmangiz qabul qilindi! Tez orada haydovchi siz bilan bog'lanadi.",
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      console.error('Error sending message to user:', error);
    }

    // Callback query ga javob berish
    await ctx.answerCbQuery('Foydalanuvchiga ruxsat berildi!');
  }
}
