import { Context } from '../interfaces/context.interface';
import { Markup } from 'telegraf';
import { CompanyInfoService } from '../services/company-info.service';
import { OrdersService } from '../../orders/orders.service';
import { OrderStatus } from '../../orders/entities/order.entity';
import {
  mainMenuKeyboard,
  mainMenuKeyboardForRegistered,
} from '../keyboards/menu.keyboard';
import { UsersService } from '../../users/users.service';

export class InfoHandler {
  constructor(
    private readonly companyInfoService: CompanyInfoService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  async handleAboutUs(ctx: Context) {
    // Kompaniya haqida ma'lumot
    const companyInfo = this.companyInfoService.getCompanyInfo();
    const aboutText = `
*Kompaniyamiz haqida:*

${companyInfo.description}

🎯 *Bizning afzalliklarimiz:*
${companyInfo.advantages.map((adv) => `• ${adv}`).join('\n')}

📍 *Manzilimiz:* ${companyInfo.address}

📞 *Bog'lanish:* ${companyInfo.phone}
🌐 *Veb-sayt:* ${companyInfo.website}
    `;

    // Foydalanuvchi ro'yxatdan o'tganligini tekshirish
    if (ctx.from) {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (user) {
        await ctx.reply(aboutText, {
          parse_mode: 'Markdown',
          ...mainMenuKeyboardForRegistered(),
        });
        return;
      }
    }

    await ctx.reply(aboutText, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  }

  async handleCompanyContact(ctx: Context) {
    // Kompaniyaning aloqa ma'lumotlari
    const contactInfo = this.companyInfoService.getContactInfo();
    const contactText = `
*📞 Muloqat o'rnatish*

Biz bilan quyidagi usullar orqali bog'lanishingiz mumkin:

📍 *Ofis manzili:* ${contactInfo.officeAddress}

📱 *Telefon raqamlarimiz:*
${contactInfo.phones.map((phone) => `• ${phone}`).join('\n')}

📧 *Elektron pochta:* ${contactInfo.email}

🕒 *Ish vaqti:*
${contactInfo.workHours}

💬 *Telegram:* ${contactInfo.telegram}
    `;

    // Foydalanuvchi ro'yxatdan o'tganligini tekshirish
    if (ctx.from) {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (user) {
        await ctx.reply(contactText, {
          parse_mode: 'Markdown',
          ...mainMenuKeyboardForRegistered(),
        });
        return;
      }
    }

    await ctx.reply(contactText, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  }

  async handleCompanyLocation(ctx: Context) {
    // Kompaniyaning manzili
    const locationInfo = this.companyInfoService.getCompanyLocation();

    // Telegramning o'z xaritasini ko'rsatish
    await ctx.replyWithLocation(locationInfo.latitude, locationInfo.longitude);

    const locationText = `
*📍 Bizning manzilimiz:*

${locationInfo.address}

${locationInfo.landmark}
${locationInfo.reference}
    `;

    // Foydalanuvchi ro'yxatdan o'tganligini tekshirish
    if (ctx.from) {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (user) {
        await ctx.reply(locationText, {
          parse_mode: 'Markdown',
          ...mainMenuKeyboardForRegistered(),
        });
        return;
      }
    }

    await ctx.reply(locationText, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  }

  // Umumiy keyboard metodlari
  private backButtonKeyboard() {
    return Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize();
  }
}
