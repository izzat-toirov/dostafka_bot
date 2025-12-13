import {
  Update,
  Ctx,
  Start,
  Action,
  Hears,
  On,
  Command,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { Context } from './interfaces/context.interface';
import { DeliveryService } from './services/delivery.service';
import { OrderService } from './services/order.service';
import { CompanyInfoService } from './services/company-info.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import {
  mainMenuKeyboard,
  mainMenuKeyboardForRegistered,
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
import { AcceptOrderHandler } from './handlers/accept-order.handler';
import { RejectOrderHandler } from './handlers/reject-order.handler';
import { ApproveUserHandler } from './handlers/approve-user.handler';
import { DenyUserHandler } from './handlers/deny-user.handler';

@Update()
export class BotUpdate {
  private readonly orderHandler: OrderHandler;
  private readonly infoHandler: InfoHandler;
  private readonly registrationHandler: RegistrationHandler;
  private readonly backHandler: BackHandler;
  private readonly textHandler: TextHandler;
  private readonly contactHandler: ContactHandler;
  private readonly locationHandler: LocationHandler;
  private readonly acceptOrderHandler: AcceptOrderHandler;
  private readonly rejectOrderHandler: RejectOrderHandler;
  private readonly approveUserHandler: ApproveUserHandler;
  private readonly denyUserHandler: DenyUserHandler;

  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly orderService: OrderService,
    private readonly companyInfoService: CompanyInfoService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {
    this.orderHandler = new OrderHandler(orderService, ordersService);
    this.infoHandler = new InfoHandler(
      companyInfoService,
      ordersService,
      usersService,
    );
    this.registrationHandler = new RegistrationHandler(orderService);
    this.backHandler = new BackHandler();
    this.textHandler = new TextHandler(orderService, ordersService);
    this.contactHandler = new ContactHandler(orderService, ordersService);
    this.locationHandler = new LocationHandler(orderService, ordersService);
    this.acceptOrderHandler = new AcceptOrderHandler(
      usersService,
      orderService,
      ordersService,
    );
    this.rejectOrderHandler = new RejectOrderHandler();
    this.approveUserHandler = new ApproveUserHandler();
    this.denyUserHandler = new DenyUserHandler();
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    // Foydalanuvchi ro'yxatdan o'tganini tekshirish
    if (ctx.from) {
      const userId = ctx.from.id;
      const user = await this.usersService.findByTelegramId(userId);

      if (!user) {
        // Foydalanuvchi ro'yxatdan o'tmagan
        await ctx.reply(
          "👋 Assalomu alaykum!\n\nBuyurtma berish uchun avval ro'yxatdan o'ting.\n\nQuyidagi tugmani bosing:",
          mainMenuKeyboard(),
        );
        return;
      }

      // Foydalanuvchi ro'yxatdan o'tgan, session da belgilash
      ctx.session.hasVisitedBefore = true;
      ctx.session.isLoggedIn = true;

      // Foydalanuvchi avval kirgan bo'lsa maxsus xabar berish
      if (ctx.session.hasVisitedBefore) {
        await ctx.reply(
          "👋 Assalomu alaykum!\n\nSiz yana ko'rganimizdan hurmatdamiz!\n\nQuyidagi tugmalardan birini tanlang:",
          mainMenuKeyboardForRegistered(),
        );
        return;
      }

      // Yangi foydalanuvchi
      await ctx.reply(
        '👋 Assalomu alaykum!\n\nXush kelibsiz! Quyidagi tugmalardan birini tanlang:',
        mainMenuKeyboardForRegistered(),
      );
    }
  }

  @Hears('Buyurtma berish (Заказать курьера)')
  async handleOrderDelivery(@Ctx() ctx: Context) {
    // Foydalanuvchi tizimga kirganini tekshirish
    if (!ctx.session.isLoggedIn) {
      await ctx.reply(
        '❌ Buyurtma berish uchun tizimga kirishingiz kerak.\n\nQuyidagi tugmani bosing:',
        mainMenuKeyboard(),
      );
      return;
    }

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
    if (ctx.from) {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (user) {
        await ctx.reply(
          '🚖 Haydovchi chaqirilmoqda...',
          mainMenuKeyboardForRegistered(),
        );
        return;
      }
    }
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

  @Hears('👤 Profil')
  async handleProfile(@Ctx() ctx: Context) {
    // Foydalanuvchi profili
    if (ctx.from) {
      const userId = ctx.from.id;
      const user = await this.usersService.findByTelegramId(userId);

      if (user) {
        await ctx.reply(
          `👤 *Sizning profilingiz:*\n\n` +
            `Ism: ${user.name}\n` +
            `Telefon: ${user.phone}\n` +
            `Ro'yxatdan o'tgan sana: ${user.createdAt.toLocaleDateString(
              'uz-UZ',
            )}`,
          { parse_mode: 'Markdown' },
        );
      } else {
        await ctx.reply('❌ Foydalanuvchi topilmadi.');
      }
    }
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
      // Foydalanuvchi ro'yxatdan o'tganligini tekshirish
      if (ctx.from) {
        const user = await this.usersService.findByTelegramId(ctx.from.id);
        if (user) {
          await ctx.reply('Bosh menyu', mainMenuKeyboardForRegistered());
        } else {
          await ctx.reply('Bosh menyu', mainMenuKeyboard());
        }
      } else {
        await ctx.reply('Bosh menyu', mainMenuKeyboard());
      }
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

  @Command('clear_orders')
  async handleClearOrders(@Ctx() ctx: Context) {
    // Faqat admin foydalanuvchilar buyurtmalarni o'chira oladi
    // Admin user ID ni tekshirish (bu yerda o'zgartirishingiz mumkin)
    const adminUserId = 5300263228; // O'zgartiring

    if (ctx.from && ctx.from.id === adminUserId) {
      try {
        await this.ordersService.deleteAllOrders();
        await ctx.reply("✅ Barcha buyurtmalar o'chirildi!");
      } catch (error) {
        console.error('Error clearing orders:', error);
        await ctx.reply(
          "❌ Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        );
      }
    } else {
      await ctx.reply("❌ Sizda bu buyruqdan foydalanish huquqi yo'q!");
    }
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

  @Action(/accept_\d+_\d+_.+_.+/)
  async handleAcceptOrder(@Ctx() ctx: Context) {
    await this.acceptOrderHandler.handleAcceptOrder(ctx);
  }

  @Action(/reject_\d+_\d+/)
  async handleRejectOrder(@Ctx() ctx: Context) {
    await this.rejectOrderHandler.handleRejectOrder(ctx);
  }

  @Action(/approve_\d+/)
  async handleApproveUser(@Ctx() ctx: Context) {
    await this.approveUserHandler.handleApproveUser(ctx);
  }

  @Action(/deny_\d+/)
  async handleDenyUser(@Ctx() ctx: Context) {
    await this.denyUserHandler.handleDenyUser(ctx);
  }
}
