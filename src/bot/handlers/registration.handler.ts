import { Context } from '../interfaces/context.interface';
import { Markup } from 'telegraf';
import { OrderService } from '../services/order.service';

export class RegistrationHandler {
  constructor(private readonly orderService: OrderService) {}

  async handleRegistration(ctx: Context) {
    ctx.session.state = 'waiting_name';
    await ctx.reply('Ismingizni kiriting:', this.backButtonKeyboard());
  }

  async handleNameInput(ctx: Context, messageText: string) {
    if (!ctx.from) return;

    ctx.session.userName = messageText;
    await ctx.reply(
      `Рахмат, ${messageText}!
      
Энди телефон рақамингизни юборинг:`,
      Markup.keyboard([
        [{ text: '📱 Телефон рақамни юбориш', request_contact: true }],
        [{ text: '◀️ Orqaga' }],
      ]).resize(),
    );
    ctx.session.state = 'waiting_phone_contact';
  }

  async handlePhoneContact(ctx: Context) {
    if (!ctx.from || !ctx.message || !('contact' in ctx.message)) return;

    const state = ctx.session?.state;
    if (state === 'waiting_phone_contact') {
      const phone = ctx.message.contact.phone_number;
      await this.orderService.registerUser(
        ctx.from.id,
        ctx.session.userName || 'User',
        phone,
      );
      await ctx.reply(
        '✅ Рўйхатдан муваффақиятли ўтдингиз!\n\nЭнди сиз барча хизматлардан фойдалана оласиз.',
        this.mainMenuKeyboard(),
      );
      ctx.session.state = null;
    }
  }

  // Umumiy keyboard metodlari
  private backButtonKeyboard() {
    return Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize();
  }

  private mainMenuKeyboard() {
    return Markup.keyboard([
      [{ text: 'Buyurtma berish (Заказать курьера)' }],
      [
        { text: 'ℹ️ Biz haqimizda' },
        { text: "📞 Muloqat o'rnatish" },
        { text: '📍 Manzilimiz' },
      ],
      [{ text: '🚚 Yetkazib berish' }, { text: '⚙️ Sozlamalar' }],
      [{ text: "📝 Ro'yxatdan o'tish" }],
    ]).resize();
  }
}
