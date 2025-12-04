import { Update, Ctx, Start, Action, Hears, On } from 'nestjs-telegraf';
import type { Context } from './interfaces/context.interface';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';
import { CompanyInfoService } from './services/company-info.service';
import {
  mainMenuKeyboard,
  deliveryMenuKeyboard,
  deliveryTypeKeyboard,
  carTypeKeyboard,
  cargoTypeKeyboard,
  locationKeyboard,
  phoneKeyboard,
} from './keyboards/menu.keyboard';
import { Markup } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly orderService: OrderService,
    private readonly companyInfoService: CompanyInfoService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      '👋 Assalomu alaykum!\n\nXush kelibsiz! Quyidagi tugmalardan birini tanlang:',
      mainMenuKeyboard(),
    );
  }

  // Buyurtma berish (Заказать курьера)

  @Hears('Buyurtma berish (Заказать курьера)')
  async handleOrderDelivery(@Ctx() ctx: Context) {
    ctx.session.orderData = {};
    ctx.session.state = 'waiting_from_location';
    await ctx.reply(
      '📍 *Qayerdan olib ketish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
      { parse_mode: 'Markdown', ...locationKeyboard() },
    );
  }

  // Manzilni yozish
  @Hears('✍️ Manzilni yozish')
  async handleWriteAddress(@Ctx() ctx: Context) {
    const state = ctx.session?.state;
    if (state === 'waiting_from_location') {
      await ctx.reply(
        "✍️ *Qayerdan olib ketish manzilini yozing:*\n\nMasalan: Toshkent, Amir Temur ko'chasi, 10-uy",
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
      ctx.session.state = 'waiting_from_address_text';
    } else if (state === 'waiting_to_location') {
      await ctx.reply(
        "✍️ *Qayerga yetkazib berish manzilini yozing:*\n\nMasalan: Toshkent, Navoiy ko'chasi, 5-uy",
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
      ctx.session.state = 'waiting_to_address_text';
    }
  }

  // Yuk turlari
  @Hears([
    '📦 Hujjatlar / Kichik yuklar',
    "📦 O'rtacha yuk (gacha 50 kg)",
    '📦 Katta yuk (50+ kg)',
  ])
  async handleCargoType(@Ctx() ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_cargo_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.cargoType = ctx.message.text;
    ctx.session.state = 'waiting_weight';

    // Og'irlik chegarasini aniqlash
    let maxWeight = '';
    if (ctx.message.text.includes('Hujjatlar')) {
      maxWeight = '1 kg';
    } else if (ctx.message.text.includes("O'rtacha")) {
      maxWeight = '50 kg';
    } else {
      maxWeight = '300 kg';
    }

    await ctx.reply(
      `⚖️ *Yuk og'irligini kiriting:*

Cheklov: ${maxWeight} gacha
Masalan: 5 kg, 10 kg`,
      { parse_mode: 'Markdown', ...mainMenuKeyboard() },
    );
  }

  // Transport turlari
  @Hears([
    '🚶 Peshkom (15 kg gacha)',
    '🚗 Legkovoy avtomobil (50 kg gacha)',
    '🚚 Gruzovoy transport (300 kg gacha)',
  ])
  async handleTransportType(@Ctx() ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_transport_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    const transportType = ctx.message.text;
    ctx.session.orderData.transportType = transportType;

    // Agar Gruzovoy tanlansa, mashina turlarini ko'rsat
    if (transportType.includes('Gruzovoy')) {
      ctx.session.state = 'waiting_car_type';
      await ctx.reply('🚗 *Mashina turini tanlang:*', {
        parse_mode: 'Markdown',
        ...carTypeKeyboard(),
      });
    } else {
      // Og'irlik chegarasini aniqlash
      let maxWeight = '';
      if (transportType.includes('Peshkom')) {
        maxWeight = '15 kg';
      } else if (transportType.includes('Legkovoy')) {
        maxWeight = '50 kg';
      } else {
        maxWeight = '300 kg';
      }

      ctx.session.state = 'waiting_phone';
      await ctx.reply(
        `📱 *Telefon raqamingizni yuboring:*

Cheklov: ${maxWeight} gacha`,
        { parse_mode: 'Markdown', ...phoneKeyboard() },
      );
    }
  }

  // Mashina turlari
  @Hears([
    '🚙 Djip/Pikap do 2 m3, 500 kg',
    '🚙 Kabluk do 3.2 m3, 700 kg',
    '🚚 Porter do 8 m3, 1000 kg',
    '🚚 Gazel do 17 m3, 1500 kg',
  ])
  async handleCarType(@Ctx() ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_car_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.transportType += ` - ${ctx.message.text}`;
    ctx.session.state = 'waiting_phone';
    await ctx.reply(
      `📱 *Telefon raqamingizni yuboring:*
  
  Cheklov: 300 kg gacha`,
      { parse_mode: 'Markdown', ...phoneKeyboard() },
    );
  }

  // Raqamni yozish
  @Hears('✍️ Raqamni yozish')
  async handleWritePhone(@Ctx() ctx: Context) {
    const state = ctx.session?.state;

    // Agar mashina tanlashda bo'lsa
    if (state === 'waiting_car_type') {
      await ctx.reply(
        '✍️ *Telefon raqamingizni yozing:*\\n\\nMasalan: +998901234567',
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
      ctx.session.state = 'waiting_phone_text_car';
    }
    // Agar telefon kiritishda bo'lsa
    else if (state === 'waiting_phone') {
      await ctx.reply(
        '✍️ *Telefon raqamingizni yozing:*\\n\\nMasalan: +998901234567',
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
      ctx.session.state = 'waiting_phone_text';
    }
  }
  @Hears('🚚 Yetkazib berish')
  async handleDelivery(@Ctx() ctx: Context) {
    await ctx.reply('🚚 Buyurtmalarim', deliveryMenuKeyboard());
  }

  // Buyurtmalarni ko'rish
  @Hears('📦 Buyurtmalarim')
  async handleMyOrders(@Ctx() ctx: Context) {
    await ctx.reply(
      "📦 *Sizning buyurtmalaringiz:*\n\nTez orada bu yerda buyurtmalar tarixi ko'rsatiladi.",
      { parse_mode: 'Markdown', ...mainMenuKeyboard() },
    );
  }

  // Settings
  @Hears('⚙️ Sozlamalar')
  async handleSettings(@Ctx() ctx: Context) {
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

  // Biz haqimizda
  @Hears('ℹ️ Biz haqimizda')
  async handleAboutUs(@Ctx() ctx: Context) {
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
      ...mainMenuKeyboard(),
    });
  }

  // Muloqat o'rnatish
  @Hears("📞 Muloqat o'rnatish")
  async handleCompanyContact(@Ctx() ctx: Context) {
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
      ...mainMenuKeyboard(),
    });
  }

  // Manzilimiz
  @Hears('📍 Manzilimiz')
  async handleCompanyLocation(@Ctx() ctx: Context) {
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
      ...mainMenuKeyboard(),
    });
  }

  // Back button
  @Hears(['◀️ Orqaga', '◀️ Назад'])
  async handleBack(@Ctx() ctx: Context) {
    const state = ctx.session?.state;

    // Buyurtma jarayonida orqaga qaytish
    if (
      state === 'waiting_to_location' ||
      state === 'waiting_to_address_text'
    ) {
      ctx.session.state = 'waiting_from_location';
      await ctx.reply(
        '📍 *Qayerdan olib ketish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (state === 'waiting_cargo_type') {
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (state === 'waiting_weight') {
      ctx.session.state = 'waiting_cargo_type';
      await ctx.reply('📦 *Yuk turini tanlang:*', {
        parse_mode: 'Markdown',
        ...cargoTypeKeyboard(),
      });
    } else if (state === 'waiting_transport_type') {
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
    } else if (state === 'waiting_car_type') {
      ctx.session.state = 'waiting_transport_type';
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_phone') {
      // Transport turiga qaytish
      ctx.session.state = 'waiting_transport_type';
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_comment') {
      ctx.session.state = 'waiting_phone';
      await ctx.reply('📱 *Telefon raqamingizni yuboring:*', {
        parse_mode: 'Markdown',
        ...phoneKeyboard(),
      });
    } else {
      // Faqat buyurtma yakunlanganda bosh menyuga qayt
      if (state && state.startsWith('waiting_')) {
        // Buyurtma jarayonida bo'lsa, hech narsa qilmaymiz
        return;
      } else {
        // Aks holda bosh menyuga qayt
        ctx.session.state = null;
        ctx.session.orderData = {};
        await ctx.reply('Bosh menyu', mainMenuKeyboard());
      }
    }
  }

  // Handle text messages based on session state
  @Hears(/.+/)
  async handleText(@Ctx() ctx: Context) {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const state = ctx.session?.state;
    const messageText = ctx.message.text;

    // Buyurtma jarayoni
    if (
      state === 'waiting_from_address_text' ||
      state === 'waiting_from_location'
    ) {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.fromAddress = messageText;
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (
      state === 'waiting_to_address_text' ||
      state === 'waiting_to_location'
    ) {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.toAddress = messageText;
      ctx.session.state = 'waiting_cargo_type';
      await ctx.reply('📦 *Yuk turini tanlang:*', {
        parse_mode: 'Markdown',
        ...cargoTypeKeyboard(),
      });
    } else if (state === 'waiting_weight') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.weight = messageText;
      ctx.session.state = 'waiting_transport_type';
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_comment') {
      ctx.session.orderData = ctx.session.orderData || {};
      if (messageText.toLowerCase() !== "yo'q") {
        ctx.session.orderData.comment = messageText;
      }

      // Buyurtma xulasasi
      const order = ctx.session.orderData;
      const summary = `
✅ *Buyurtma qabul qilindi!*

📍 *Qayerdan:* ${order.fromAddress}
📍 *Qayerga:* ${order.toAddress}
📦 *Yuk:* ${order.cargoType}
⚖️ *Og'irlik:* ${order.weight}
🚗 *Transport:* ${order.transportType}
📱 *Telefon:* ${order.phone}
${order.comment ? `📝 *Izoh:* ${order.comment}` : ''}

⏱ *Haydovchi tez orada bog'lanadi!*
      `;

      await ctx.reply(summary, {
        parse_mode: 'Markdown',
        ...mainMenuKeyboard(),
      });

      // Buyurtmani saqlash
      await this.orderService.saveReview(ctx.from.id, JSON.stringify(order));

      ctx.session.state = null;
      ctx.session.orderData = {};
    } else if (state === 'waiting_review') {
      await this.orderService.saveReview(ctx.from.id, messageText);
      await ctx.reply(
        '✅ Fikr-mulohazangiz uchun rahmat!\n\nБизга ишонч билдирганингиз учун рахмат!',
        mainMenuKeyboard(),
      );
      ctx.session.state = null;
    } else if (state === 'waiting_name') {
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
    } else if (state === 'waiting_phone_text') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.phone = messageText;
      ctx.session.state = 'waiting_comment';
      await ctx.reply(
        '📝 *Qo\'shimcha izoh (ixtiyoriy):*\n\nYoki "Yo\'q" deb yuboring:',
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
    } else if (state === 'waiting_phone_text_car') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.phone = messageText;
      ctx.session.state = 'waiting_comment';
      await ctx.reply(
        '📝 *Qo\'shimcha izoh (ixtiyoriy):*\n\nYoki "Yo\'q" deb yuboring:',
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
    }
  }

  // Handle contact
  @On('contact')
  async handleUserContact(@Ctx() ctx: Context) {
    if (!ctx.from || !ctx.message || !('contact' in ctx.message)) return;

    const state = ctx.session?.state;
    if (state === 'waiting_phone') {
      const phone = ctx.message.contact.phone_number;
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.phone = phone;
      ctx.session.state = 'waiting_comment';
      await ctx.reply(
        '📝 *Qo\'shimcha izoh (ixtiyoriy):*\n\nYoki "Yo\'q" deb yuboring:',
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
    } else if (state === 'waiting_phone_contact') {
      const phone = ctx.message.contact.phone_number;
      await this.orderService.registerUser(
        ctx.from.id,
        ctx.session.userName || 'User',
        phone,
      );
      await ctx.reply(
        '✅ Рўйхатдан муваффақиятли ўтдингиз!\n\nЭнди сиз барча хизматлардан фойдалана оласиз.',
        mainMenuKeyboard(),
      );
      ctx.session.state = null;
    }
  }

  // Handle location
  @On('location')
  async handleUserLocation(@Ctx() ctx: Context) {
    if (!ctx.from || !ctx.message || !('location' in ctx.message)) return;

    const state = ctx.session?.state;
    const location = ctx.message.location;
    const locationText = `${location.latitude}, ${location.longitude}`;

    if (state === 'waiting_from_location') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.fromAddress = locationText;
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (state === 'waiting_to_location') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.toAddress = locationText;
      ctx.session.state = 'waiting_cargo_type';
      await ctx.reply('📦 *Yuk turini tanlang:*', {
        parse_mode: 'Markdown',
        ...cargoTypeKeyboard(),
      });
    }
  }
}
