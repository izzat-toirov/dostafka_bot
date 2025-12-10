import { Context } from '../interfaces/context.interface';
import { Markup } from 'telegraf';
import { OrderService } from '../services/order.service';
import {
  mainMenuKeyboard,
  backButtonKeyboard,
} from '../keyboards/menu.keyboard';

export class RegistrationHandler {
  constructor(private readonly orderService: OrderService) {}

  async handleRegistration(ctx: Context) {
    // Foydalanuvchini ro'yxatdan o'tkazish jarayonini boshlash
    ctx.session.state = 'waiting_name';
    await ctx.reply('Ismingizni kiriting:', this.backButtonKeyboard());
  }

  async handleNameInput(ctx: Context, messageText: string) {
    // Foydalanuvchi ismini saqlash va telefon raqamini so'rash
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
    // Foydalanuvchi telefon raqamini qabul qilish va ro'yxatdan o'tkazish
    if (!ctx.from || !ctx.message || !('contact' in ctx.message)) return;

    const state = ctx.session?.state;
    if (state === 'waiting_phone_contact') {
      const phone = ctx.message.contact.phone_number;

      try {
        const user = await this.orderService.registerUser(
          ctx.from.id,
          ctx.session.userName || 'User',
          phone,
        );

        await ctx.reply(
          `✅ Рўйхатдан муваффақиятли ўтдингиз!
          
Энди сиз барча хизматлардан фойдалана оласиз.
          
Ф.И.Ш: ${user.name}
Телефон: ${user.phone}`,
          this.mainMenuKeyboard(),
        );
      } catch (error) {
        console.error('Registration error:', error);
        await ctx.reply(
          '❌ Рўйхатдан ўтишда хатолик юз берди. Илтимос, қайтадан уриниб кўринг.',
          this.mainMenuKeyboard(),
        );
      }

      ctx.session.state = null;
    }
  }

  // Umumiy keyboard metodlari
  private backButtonKeyboard() {
    return backButtonKeyboard();
  }

  private mainMenuKeyboard() {
    return mainMenuKeyboard();
  }
}
