import { Context } from '../interfaces/context.interface';
import { Markup } from 'telegraf';
import { CompanyInfoService } from '../services/company-info.service';
import { OrdersService } from '../../orders/orders.service';
import { OrderStatus } from '../../orders/entities/order.entity';

export class InfoHandler {
  constructor(
    private readonly companyInfoService: CompanyInfoService,
    private readonly ordersService: OrdersService,
  ) {}

  async handleMyOrders(ctx: Context) {
    // Foydalanuvchi tizimga kirganini tekshirish
    if (!ctx.session.isLoggedIn) {
      await ctx.reply(
        "❌ Buyurtmalarni ko'rish uchun tizimga kirishingiz kerak.\n\nQuyidagi tugmani bosing:",
        this.mainMenuKeyboard(),
      );
      return;
    }

    // Foydalanuvchining buyurtmalarini ko'rsatish
    if (!ctx.from) return;

    try {
      const orders = await this.ordersService.findAllOrders();
      // Faqat ruxsat berilgan (confirmed) va active buyurtmalarni ko'rsatish
      const userOrders = orders.filter(
        (order) =>
          order.userId === ctx.from!.id &&
          order.status === OrderStatus.CONFIRMED &&
          order.isActive === true,
      );

      if (userOrders.length === 0) {
        await ctx.reply(
          "📦 *Sizning ruxsat berilgan buyurtmalaringiz:*\n\nHozircha ruxsat berilgan buyurtmalar yo'q.",
          {
            parse_mode: 'Markdown',
            ...this.backButtonKeyboard(),
          },
        );
        return;
      }

      let ordersText = '📦 *Sizning ruxsat berilgan buyurtmalaringiz:*\n\n';

      for (const order of userOrders) {
        ordersText += `ID: ${order.id}\n`;
        ordersText += `Mahsulot: ${order.productName}\n`;
        ordersText += `Miqdori: ${order.quantity}\n`;
        ordersText += `Manzil: ${order.deliveryAddress}\n`;
        ordersText += `Holati: ${order.status}\n`;
        ordersText += `Sana: ${order.createdAt.toLocaleString()}\n\n`;
      }

      await ctx.reply(ordersText, {
        parse_mode: 'Markdown',
        ...this.backButtonKeyboard(),
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      await ctx.reply(
        "❌ Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        {
          parse_mode: 'Markdown',
          ...this.backButtonKeyboard(),
        },
      );
    }
  }

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

    await ctx.reply(aboutText, {
      parse_mode: 'Markdown',
      ...this.mainMenuKeyboard(),
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

    await ctx.reply(contactText, {
      parse_mode: 'Markdown',
      ...this.mainMenuKeyboard(),
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
      [{ text: '📦 Buyurtmalarim' }],
      [{ text: "📝 Ro'yxatdan o'tish" }],
    ]).resize();
  }
}
