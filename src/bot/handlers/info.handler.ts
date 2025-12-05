import { Context } from '../interfaces/context.interface';
import { Markup } from 'telegraf';
import { CompanyInfoService } from '../services/company-info.service';

export class InfoHandler {
  constructor(private readonly companyInfoService: CompanyInfoService) {}

  async handleMyOrders(ctx: Context) {
    await ctx.reply(
      "📦 *Sizning buyurtmalaringiz:*\n\nTez orada bu yerda buyurtmalar tarixi ko'rsatiladi.",
      {
        parse_mode: 'Markdown',
        ...this.backButtonKeyboard(),
      },
    );
  }

  async handleSettings(ctx: Context) {
    await ctx.reply('⚙️ Sozlamalar\n\nTilni tanlang / Выберите язык:', {
      reply_markup: {
        keyboard: [
          [{ text: "🇺🇿 O'zbekcha" }, { text: '🇷🇺 Русский' }],
          [{ text: '◀️ Orqaga' }],
        ],
        resize_keyboard: true,
      },
    });
  }

  async handleAboutUs(ctx: Context) {
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

    await ctx.reply(aboutText, {
      parse_mode: 'Markdown',
      ...this.mainMenuKeyboard(),
    });
  }

  async handleCompanyContact(ctx: Context) {
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

    await ctx.reply(contactText, {
      parse_mode: 'Markdown',
      ...this.mainMenuKeyboard(),
    });
  }

  async handleCompanyLocation(ctx: Context) {
    const locationInfo = this.companyInfoService.getCompanyLocation();
    // Kompaniyaning geografik manzilini yuborish
    await ctx.replyWithLocation(locationInfo.latitude, locationInfo.longitude);

    const locationText = `
*📍 Bizning manzilimiz:*

${locationInfo.address}

${locationInfo.landmark}
${locationInfo.reference}
    `;

    await ctx.reply(locationText, {
      parse_mode: 'Markdown',
      ...this.mainMenuKeyboard(),
    });
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
