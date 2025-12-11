import { Update, Ctx, Start, Action, Hears, On } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { Context } from './interfaces/context.interface';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';
import { CompanyInfoService } from './services/company-info.service';
import { OrdersService } from '../orders/orders.service';
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
import { BackHandler } from './handlers/back.handler';
import { TextHandler } from './handlers/text.handler';
import { ContactHandler } from './handlers/contact.handler';
import { LocationHandler } from './handlers/location.handler';

@Update()
export class BotUpdate {
  private readonly orderHandler: OrderHandler;
  private readonly infoHandler: InfoHandler;
  private readonly registrationHandler: RegistrationHandler;
  private readonly backHandler: BackHandler;
  private readonly textHandler: TextHandler;
  private readonly contactHandler: ContactHandler;
  private readonly locationHandler: LocationHandler;

  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly orderService: OrderService,
    private readonly companyInfoService: CompanyInfoService,
    private readonly ordersService: OrdersService,
  ) {
    this.orderHandler = new OrderHandler(orderService, ordersService);
    this.infoHandler = new InfoHandler(companyInfoService, ordersService);
    this.registrationHandler = new RegistrationHandler(orderService);
    this.backHandler = new BackHandler();
    this.textHandler = new TextHandler(orderService, ordersService);
    this.contactHandler = new ContactHandler(orderService, ordersService);
    this.locationHandler = new LocationHandler(orderService, ordersService);
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    // Foydalanuvchiga boshlang'ich xabar va menyuni ko'rsatish
    await ctx.reply(
      '👋 Assalomu alaykum!\n\nXush kelibsiz! Quyidagi tugmalardan birini tanlang:',
      mainMenuKeyboard(),
    );
  }

  @Hears('Buyurtma berish (Заказать курьера)')
  async handleOrderDelivery(@Ctx() ctx: Context) {
    // Buyurtma berish jarayonini boshlash - avval transport turini tanlash
    ctx.session.state = 'waiting_transport_type';
    await ctx.reply('🚗 *Transport turini tanlang:*', {
      parse_mode: 'Markdown',
      ...deliveryTypeKeyboard(),
    });
  }

  @Hears('✍️ Manzilni yozish')
  async handleWriteAddress(@Ctx() ctx: Context) {
    await this.orderHandler.handleWriteAddress(ctx);
  }

  @Hears('🚖 Haydovchi chaqirish')
  async handleCallDriver(@Ctx() ctx: Context) {
    // Haydovchi chaqirish funksiyasi
    await ctx.reply('🚖 Haydovchi chaqirilmoqda...', mainMenuKeyboard());
  }

  @Hears([
    '📦 Hujjatlar / Kichik yuklar',
    "📦 O'rtacha yuk (gacha 50 kg)",
    '📦 Katta yuk (50+ kg)',
  ])
  async handleCargoType(@Ctx() ctx: Context) {
    // Yuk turi tanlovi
    await this.orderHandler.handleCargoType(ctx);
  }

  @Hears([
    '🚶 Peshkom (15 kg gacha)',
    '🚗 Legkovoy avtomobil (50 kg gacha)',
    '🚚 Gruzovoy transport',
  ])
  async handleTransportType(@Ctx() ctx: Context) {
    // Transport turi tanlovi
    await this.orderHandler.handleTransportType(ctx);
  }

  @Hears([
    '🚙 Djip/Pikap do 2 m3, 500 kg',
    '🚙 Kabluk do 3.2 m3, 700 kg',
    '🚚 Porter do 8 m3, 1000 kg',
    '🚚 Gazel do 17 m3, 1500 kg',
  ])
  async handleCarType(@Ctx() ctx: Context) {
    // Avtomobil turi tanlovi
    await this.orderHandler.handleCarType(ctx);
  }

  @Hears('✍️ Raqamni yozish')
  async handleWritePhone(@Ctx() ctx: Context) {
    // Telefon raqamini matn sifatida kiritish
    await this.orderHandler.handleWritePhone(ctx);
  }

  @Hears('🚚 Yetkazib berish')
  async handleDelivery(@Ctx() ctx: Context) {
    // Yetkazib berish menyusini ko'rsatish
    await ctx.reply('🚚 Buyurtmalarim', deliveryMenuKeyboard());
  }

  @Hears('📦 Buyurtmalarim')
  async handleMyOrders(@Ctx() ctx: Context) {
    // Foydalanuvchining buyurtmalarini ko'rsatish
    await this.infoHandler.handleMyOrders(ctx);
  }

  @Hears('⚙️ Sozlamalar')
  async handleSettings(@Ctx() ctx: Context) {
    // Sozlamalar menyusini ko'rsatish
    await this.infoHandler.handleSettings(ctx);
  }

  @Hears('ℹ️ Biz haqimizda')
  async handleAboutUs(@Ctx() ctx: Context) {
    // Kompaniya haqida ma'lumot
    await this.infoHandler.handleAboutUs(ctx);
  }

  @Hears("📞 Muloqat o'rnatish")
  async handleCompanyContact(@Ctx() ctx: Context) {
    // Kompaniyaning aloqa ma'lumotlari
    await this.infoHandler.handleCompanyContact(ctx);
  }

  @Hears('📍 Manzilimiz')
  async handleCompanyLocation(@Ctx() ctx: Context) {
    // Kompaniyaning manzili
    await this.infoHandler.handleCompanyLocation(ctx);
  }

  @Hears("📝 Ro'yxatdan o'tish")
  async handleRegistration(@Ctx() ctx: Context) {
    // Foydalanuvchini ro'yxatdan o'tkazish
    await this.registrationHandler.handleRegistration(ctx);
  }

  @Hears(['◀️ Orqaga', '◀️ Назад'])
  async handleBack(@Ctx() ctx: Context) {
    // Orqaga qaytish
    await this.backHandler.handleBack(ctx);
  }

  @Hears(/.+/)
  async handleText(@Ctx() ctx: Context) {
    // Matnli xabarlarga javob berish
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const messageText = ctx.message.text;

    // Orqaga qaytish
    if (messageText === '◀️ Orqaga') {
      await this.backHandler.handleBack(ctx);
      return;
    }

    // Bosh menyuga qaytish
    if (messageText === '🏠 Bosh menyu') {
      ctx.session.state = null;
      ctx.session.orderData = {};
      await ctx.reply('Bosh menyu', mainMenuKeyboard());
      return;
    }

    // Davom etish
    if (messageText === '⏭ Davom etish') {
      const state = ctx.session?.state;
      // Mahsulotlar uchun manzil kiritish jarayonida davom etish
      if (state && state.startsWith('waiting_product_location_')) {
        // Handle continue logic in text handler
        await this.textHandler.handleText(ctx, messageText);
        return;
      }
    }

    await this.textHandler.handleText(ctx, messageText);
  }

  @On('contact')
  async handleUserContact(@Ctx() ctx: Context) {
    // Kontakt ma'lumotlarini qabul qilish
    if (!ctx.from || !ctx.message || !('contact' in ctx.message)) return;

    const state = ctx.session?.state;

    if (state === 'waiting_phone_contact') {
      await this.registrationHandler.handlePhoneContact(ctx);
    } else if (state === 'waiting_phone') {
      await this.orderHandler.handlePhone(ctx);
    } else {
      await this.contactHandler.handleUserContact(ctx);
    }
  }

  @On('location')
  async handleUserLocation(@Ctx() ctx: Context) {
    // Lokatsiya ma'lumotlarini qabul qilish
    if (!ctx.from || !ctx.message || !('location' in ctx.message)) return;

    const state = ctx.session?.state;

    if (
      state === 'waiting_from_location' ||
      state === 'waiting_to_location' ||
      state === 'waiting_additional_location' ||
      state === 'waiting_additional_location_choice' ||
      (state && state.startsWith('waiting_product_location_'))
    ) {
      await this.locationHandler.handleUserLocation(ctx);
    } else {
      await this.locationHandler.handleUserLocation(ctx);
    }
  }

  @Action(/accept_\d+_\d+/)
  async handleAcceptOrder(@Ctx() ctx: Context) {
    // Buyurtmani qabul qilish
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const callbackData = ctx.callbackQuery.data;
    const [, orderId, userId] = callbackData.split('_');

    // Xabarni yangilash - buyurtma qabul qilinganligini ko'rsatish
    const message = ctx.callbackQuery.message;
    if (message && 'text' in message) {
      const updatedText = `${message.text}\n\n✅ *Buyurtma qabul qilindi!*`;
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
    await ctx.answerCbQuery('Buyurtma qabul qilindi!');
  }

  @Action(/reject_\d+_\d+/)
  async handleRejectOrder(@Ctx() ctx: Context) {
    // Buyurtmani rad etish
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const callbackData = ctx.callbackQuery.data;
    const [, orderId, userId] = callbackData.split('_');

    // Xabarni yangilash - buyurtma rad etilganligini ko'rsatish
    const message = ctx.callbackQuery.message;
    if (message && 'text' in message) {
      const updatedText = `${message.text}\n\n❌ *Buyurtma rad etildi*`;
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
        "😔 Sizning buyurtmangiz rad etildi. Iltimos, keyinroq qayta urinib ko'ring.",
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      console.error('Error sending message to user:', error);
    }

    // Callback query ga javob berish
    await ctx.answerCbQuery('Buyurtma rad etildi!');
  }
}
