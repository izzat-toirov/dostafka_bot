import { Update, Ctx, Start, Action, Hears, On } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { Context } from './interfaces/context.interface';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';
import { CompanyInfoService } from './services/company-info.service';
import {
  mainMenuKeyboard,
  deliveryMenuKeyboard,
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

  // Buyurtma berish (Заказать курьера)
  @Hears('Buyurtma berish (Заказать курьера)')
  async handleOrderDelivery(@Ctx() ctx: Context) {
    await this.orderHandler.handleOrderDelivery(ctx);
  }

  // Manzilni yozish
  @Hears('✍️ Manzilni yozish')
  async handleWriteAddress(@Ctx() ctx: Context) {
    await this.orderHandler.handleWriteAddress(ctx);
  }

  // asdasdsadadasd
  // Yuk turlari
  @Hears([
    '📦 Hujjatlar / Kichik yuklar',
    "📦 O'rtacha yuk (gacha 50 kg)",
    '📦 Katta yuk (50+ kg)',
  ])
  async handleCargoType(@Ctx() ctx: Context) {
    await this.orderHandler.handleCargoType(ctx);
  }

  // Transport turlari
  @Hears([
    '🚶 Peshkom (15 kg gacha)',
    '🚗 Legkovoy avtomobil (50 kg gacha)',
    '🚚 Gruzovoy transport',
  ])
  async handleTransportType(@Ctx() ctx: Context) {
    await this.orderHandler.handleTransportType(ctx);
  }

  // Mashina turlari
  @Hears([
    '🚙 Djip/Pikap do 2 m3, 500 kg',
    '🚙 Kabluk do 3.2 m3, 700 kg',
    '🚚 Porter do 8 m3, 1000 kg',
    '🚚 Gazel do 17 m3, 1500 kg',
  ])
  async handleCarType(@Ctx() ctx: Context) {
    await this.orderHandler.handleCarType(ctx);
  }

  // Raqamni yozish
  @Hears('✍️ Raqamni yozish')
  async handleWritePhone(@Ctx() ctx: Context) {
    await this.orderHandler.handleWritePhone(ctx);
  }

  @Hears('🚚 Yetkazib berish')
  async handleDelivery(@Ctx() ctx: Context) {
    await ctx.reply('🚚 Buyurtmalarim', deliveryMenuKeyboard());
  }

  // Buyurtmalarni ko'rish
  @Hears('📦 Buyurtmalarim')
  async handleMyOrders(@Ctx() ctx: Context) {
    await this.infoHandler.handleMyOrders(ctx);
  }

  // Settings
  @Hears('⚙️ Sozlamalar')
  async handleSettings(@Ctx() ctx: Context) {
    await this.infoHandler.handleSettings(ctx);
  }

  // Biz haqimizda
  @Hears('ℹ️ Biz haqimizda')
  async handleAboutUs(@Ctx() ctx: Context) {
    await this.infoHandler.handleAboutUs(ctx);
  }

  // Muloqat o'rnatish
  @Hears("📞 Muloqat o'rnatish")
  async handleCompanyContact(@Ctx() ctx: Context) {
    await this.infoHandler.handleCompanyContact(ctx);
  }

  // Manzilimiz
  @Hears('📍 Manzilimiz')
  async handleCompanyLocation(@Ctx() ctx: Context) {
    await this.infoHandler.handleCompanyLocation(ctx);
  }

  // Ro'yxatdan o'tish
  @Hears("📝 Ro'yxatdan o'tish")
  async handleRegistration(@Ctx() ctx: Context) {
    await this.registrationHandler.handleRegistration(ctx);
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
        { parse_mode: 'Markdown', ...this.locationKeyboard() },
      );
    } else if (state === 'waiting_cargo_type') {
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...this.locationKeyboard() },
      );
    } else if (state === 'waiting_weight') {
      ctx.session.state = 'waiting_cargo_type';
      await ctx.reply('📦 *Yuk turini tanlang:*', {
        parse_mode: 'Markdown',
        ...this.cargoTypeKeyboard(),
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
        ...this.deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_phone') {
      // Transport turiga qaytish
      ctx.session.state = 'waiting_transport_type';
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...this.deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_comment') {
      ctx.session.state = 'waiting_phone';
      await ctx.reply('📱 *Telefon raqamingizni yuboring:*', {
        parse_mode: 'Markdown',
        ...this.phoneKeyboard(),
      });
    } else if (
      state === 'waiting_from_location' ||
      state === 'waiting_from_address_text'
    ) {
      // Buyurtma berishdan bosh menyuga qaytish
      ctx.session.state = null;
      ctx.session.orderData = {};
      await ctx.reply('Bosh menyu', mainMenuKeyboard());
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

    // Ro'yxatdan o'tish
    if (state === 'waiting_name') {
      await this.registrationHandler.handleNameInput(ctx, messageText);
    }
    // Buyurtma jarayoni
    else {
      await this.orderHandler.handleText(ctx, messageText);
    }
  }

  // Handle contact
  @On('contact')
  async handleUserContact(@Ctx() ctx: Context) {
    const state = ctx.session?.state;

    if (state === 'waiting_phone_contact') {
      await this.registrationHandler.handlePhoneContact(ctx);
    } else {
      await this.orderHandler.handleUserContact(ctx);
    }
  }

  // Handle location
  @On('location')
  async handleUserLocation(@Ctx() ctx: Context) {
    await this.orderHandler.handleUserLocation(ctx);
  }

  // Umumiy keyboard metodlari
  private locationKeyboard() {
    return Markup.keyboard([
      [{ text: '📍 Lokatsiyani yuborish', request_location: true }],
      [{ text: '✍️ Manzilni yozish' }],
      [{ text: '◀️ Orqaga' }],
    ]).resize();
  }

  private cargoTypeKeyboard() {
    return Markup.keyboard([
      [{ text: '📦 Hujjatlar / Kichik yuklar' }],
      [{ text: "📦 O'rtacha yuk (gacha 50 kg)" }],
      [{ text: '📦 Katta yuk (50+ kg)' }],
      [{ text: '◀️ Orqaga' }],
    ]).resize();
  }

  private deliveryTypeKeyboard() {
    return Markup.keyboard([
      [
        { text: '🚶 Peshkom (15 kg gacha)' },
        { text: '🚗 Legkovoy avtomobil (50 kg gacha)' },
      ],
      [{ text: '🚚 Gruzovoy transport' }],
      [{ text: '◀️ Orqaga' }],
    ]).resize();
  }

  private phoneKeyboard() {
    return Markup.keyboard([
      [{ text: '📱 Telefon raqamni yuborish', request_contact: true }],
      [{ text: '✍️ Raqamni yozish' }],
      [{ text: '◀️ Orqaga' }],
    ]).resize();
  }
}
