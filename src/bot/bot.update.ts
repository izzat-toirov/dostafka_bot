import { Update, Ctx, Start, Action, Hears, On } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { Context } from './interfaces/context.interface';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';
import { CompanyInfoService } from './services/company-info.service';
import {
  mainMenuKeyboard,
  deliveryMenuKeyboard,
  locationKeyboard,
  cargoTypeKeyboard,
  deliveryTypeKeyboard,
  phoneKeyboard,
  backButtonKeyboard,
} from './keyboards/menu.keyboard';
import { OrderHandler } from './handlers/order.handler';
import { InfoHandler } from './handlers/info.handler';
import { RegistrationHandler } from './handlers/registration.handler';
import { Markup } from 'telegraf';

@Update()
export class BotUpdate {
  private readonly orderHandler: OrderHandler;
  private readonly infoHandler: InfoHandler;
  private readonly registrationHandler: RegistrationHandler;

  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly orderService: OrderService,
    private readonly companyInfoService: CompanyInfoService,
  ) {
    this.orderHandler = new OrderHandler(orderService);
    this.infoHandler = new InfoHandler(companyInfoService);
    this.registrationHandler = new RegistrationHandler(orderService);
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      '👋 Assalomu alaykum!\n\nXush kelibsiz! Quyidagi tugmalardan birini tanlang:',
      mainMenuKeyboard(),
    );
  }

  @Hears('Buyurtma berish (Заказать курьера)')
  async handleOrderDelivery(@Ctx() ctx: Context) {
    ctx.session.state = 'waiting_from_location';
    await ctx.reply(
      '📍 *Qayerdan olib ketish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
      { parse_mode: 'Markdown', ...locationKeyboard() },
    );
  }

  @Hears('✍️ Manzilni yozish')
  async handleWriteAddress(@Ctx() ctx: Context) {
    await this.orderHandler.handleWriteAddress(ctx);
  }

  @Hears([
    '📦 Hujjatlar / Kichik yuklar',
    "📦 O'rtacha yuk (gacha 50 kg)",
    '📦 Katta yuk (50+ kg)',
  ])
  async handleCargoType(@Ctx() ctx: Context) {
    await this.orderHandler.handleCargoType(ctx);
  }

  @Hears([
    '🚶 Peshkom (15 kg gacha)',
    '🚗 Legkovoy avtomobil (50 kg gacha)',
    '🚚 Gruzovoy transport',
  ])
  async handleTransportType(@Ctx() ctx: Context) {
    await this.orderHandler.handleTransportType(ctx);
  }

  @Hears([
    '🚙 Djip/Pikap do 2 m3, 500 kg',
    '🚙 Kabluk do 3.2 m3, 700 kg',
    '🚚 Porter do 8 m3, 1000 kg',
    '🚚 Gazel do 17 m3, 1500 kg',
  ])
  async handleCarType(@Ctx() ctx: Context) {
    await this.orderHandler.handleCarType(ctx);
  }

  @Hears('✍️ Raqamni yozish')
  async handleWritePhone(@Ctx() ctx: Context) {
    await this.orderHandler.handleWritePhone(ctx);
  }

  @Hears('🚚 Yetkazib berish')
  async handleDelivery(@Ctx() ctx: Context) {
    await ctx.reply('🚚 Buyurtmalarim', deliveryMenuKeyboard());
  }

  @Hears('📦 Buyurtmalarim')
  async handleMyOrders(@Ctx() ctx: Context) {
    await this.infoHandler.handleMyOrders(ctx);
  }

  @Hears('⚙️ Sozlamalar')
  async handleSettings(@Ctx() ctx: Context) {
    await this.infoHandler.handleSettings(ctx);
  }

  @Hears('ℹ️ Biz haqimizda')
  async handleAboutUs(@Ctx() ctx: Context) {
    await this.infoHandler.handleAboutUs(ctx);
  }

  @Hears("📞 Muloqat o'rnatish")
  async handleCompanyContact(@Ctx() ctx: Context) {
    await this.infoHandler.handleCompanyContact(ctx);
  }

  @Hears('📍 Manzilimiz')
  async handleCompanyLocation(@Ctx() ctx: Context) {
    await this.infoHandler.handleCompanyLocation(ctx);
  }

  @Hears("📝 Ro'yxatdan o'tish")
  async handleRegistration(@Ctx() ctx: Context) {
    await this.registrationHandler.handleRegistration(ctx);
  }

  @Hears(['◀️ Orqaga', '◀️ Назад'])
  async handleBack(@Ctx() ctx: Context) {
    const state = ctx.session?.state;

    if (state === 'waiting_name') {
      ctx.session.state = null;
      ctx.session.userName = undefined;
      await ctx.reply('Bosh menyu', mainMenuKeyboard());
    } else if (state === 'waiting_phone_contact') {
      ctx.session.state = 'waiting_name';
      await ctx.reply('Ismingizni kiriting:', backButtonKeyboard());
    } else if (
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
    } else if (
      state === 'waiting_from_location' ||
      state === 'waiting_from_address_text'
    ) {
      ctx.session.state = null;
      ctx.session.orderData = {};
      await ctx.reply('Bosh menyu', mainMenuKeyboard());
    } else if (state === 'waiting_additional_location_choice') {
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (
      state === 'waiting_additional_location' ||
      state === 'waiting_additional_location_text'
    ) {
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else {
      if (state && state.startsWith('waiting_')) {
        return;
      } else {
        ctx.session.state = null;
        ctx.session.orderData = {};
        await ctx.reply('Bosh menyu', mainMenuKeyboard());
      }
    }
  }

  @Hears(/.+/)
  async handleText(@Ctx() ctx: Context) {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const state = ctx.session?.state;
    const messageText = ctx.message.text;

    if (state === 'waiting_name') {
      await this.registrationHandler.handleNameInput(ctx, messageText);
    } else if (state === 'waiting_from_address_text') {
      ctx.session.orderData = {
        ...ctx.session.orderData,
        fromAddress: messageText,
      };
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (state === 'waiting_to_address_text') {
      ctx.session.orderData = {
        ...ctx.session.orderData,
        toAddress: messageText,
      };

      const additionalLocationKeyboard = Markup.keyboard([
        [{ text: '📍 Qo‘shimcha manzilni yuborish', request_location: true }],
        [{ text: '✍️ Qo‘shimcha manzilni yozish' }],
        [{ text: '⏭ Davom etish' }],
        [{ text: '◀️ Orqaga' }],
      ]).resize();

      await ctx.reply(
        'Agar qo‘shimcha manzil bo‘lsa, lokatsiya yuboring. Aks holda "Davom etish" tugmasini bosing:',
        additionalLocationKeyboard,
      );
      ctx.session.state = 'waiting_additional_location_choice';
    } else if (state === 'waiting_additional_location_text') {
      ctx.session.orderData = {
        ...ctx.session.orderData,
        additionalAddress: messageText,
      };

      ctx.session.state = 'waiting_transport_type';
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_additional_location_choice') {
      if (messageText === '⏭ Davom etish') {
        ctx.session.state = 'waiting_transport_type';
        // Show only transport type selection
        await ctx.reply('🚗 *Transport turini tanlang:*', {
          parse_mode: 'Markdown',
          ...deliveryTypeKeyboard(),
        });
      } else if (messageText === '✍️ Qo‘shimcha manzilni yozish') {
        await ctx.reply(
          "✍️ *Qo‘shimcha manzilni yozing:*\n\nMasalan: Toshkent, Chilonzor ko'chasi, 15-uy",
          { parse_mode: 'Markdown', ...backButtonKeyboard() },
        );
        ctx.session.state = 'waiting_additional_location_text';
      } else {
        await this.orderHandler.handleText(ctx, messageText);
      }
    } else {
      await this.orderHandler.handleText(ctx, messageText);
    }
  }

  @On('contact')
  async handleUserContact(@Ctx() ctx: Context) {
    const state = ctx.session?.state;

    if (state === 'waiting_phone_contact') {
      await this.registrationHandler.handlePhoneContact(ctx);
    } else {
      await this.orderHandler.handleUserContact(ctx);
    }
  }

  @On('location')
  async handleUserLocation(@Ctx() ctx: Context) {
    const state = ctx.session?.state;

    if (!ctx.message || !('location' in ctx.message)) return;

    if (state === 'waiting_from_location') {
      const location = ctx.message.location;
      ctx.session.orderData = {
        ...ctx.session.orderData,
        fromAddress: `Lokatsiya: ${location.latitude}, ${location.longitude}`,
      };
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (state === 'waiting_to_location') {
      const location = ctx.message.location;
      ctx.session.orderData = {
        ...ctx.session.orderData,
        toAddress: `Lokatsiya: ${location.latitude}, ${location.longitude}`,
      };

      const additionalLocationKeyboard = Markup.keyboard([
        [{ text: '📍 Qo‘shimcha manzilni yuborish', request_location: true }],
        [{ text: '✍️ Qo‘shimcha manzilni yozish' }],
        [{ text: '⏭ Davom etish' }],
        [{ text: '◀️ Orqaga' }],
      ]).resize();

      await ctx.reply(
        'Agar qo‘shimcha manzil bo‘lsa, lokatsiya yuboring. Aks holda "Davom etish" tugmasini bosing:',
        additionalLocationKeyboard,
      );
      ctx.session.state = 'waiting_additional_location_choice';
    } else if (state === 'waiting_additional_location') {
      const location = ctx.message.location;
      ctx.session.orderData = {
        ...ctx.session.orderData,
        additionalAddress: `Lokatsiya: ${location.latitude}, ${location.longitude}`,
      };

      ctx.session.state = 'waiting_transport_type';
      // Show only transport type selection
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_additional_location_choice') {
      const location = ctx.message.location;
      ctx.session.orderData = {
        ...ctx.session.orderData,
        additionalAddress: `Lokatsiya: ${location.latitude}, ${location.longitude}`,
      };

      ctx.session.state = 'waiting_transport_type';
      // Show only transport type selection
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else {
      await this.orderHandler.handleUserLocation(ctx);
    }
  }
}
