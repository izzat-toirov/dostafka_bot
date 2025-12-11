import { Context } from '../interfaces/context.interface';
import { Markup } from 'telegraf';
import {
  locationKeyboard,
  cargoTypeKeyboard,
  deliveryTypeKeyboard,
  carTypeKeyboard,
  phoneKeyboard,
  paymentMethodKeyboard,
  mainMenuKeyboard,
} from '../keyboards/menu.keyboard';
import { OrderService } from '../services/order.service';
import { OrdersService } from '../../orders/orders.service';
import { OrderStatus } from '../../orders/entities/order.entity';

export class OrderHandler {
  constructor(
    private readonly orderService: OrderService,
    private readonly ordersService: OrdersService,
  ) {}

  async handleOrderDelivery(ctx: Context) {
    // Buyurtma berish jarayonini boshlash
    ctx.session.orderData = {};
    ctx.session.state = 'waiting_from_location';
    await ctx.reply(
      '📍 *Qayerdan olib ketish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
      { parse_mode: 'Markdown', ...locationKeyboard() },
    );
  }

  async handleUserLocation(ctx: Context) {
    // Lokatsiya ma'lumotlarini qabul qilish
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

      // Birinchi mahsulotni avtomatik ravishda saqlaymiz
      ctx.session.orderData.productLocations =
        ctx.session.orderData.productLocations || {};
      ctx.session.orderData.productLocations[1] = locationText;

      // Ikkinchi mahsulotdan boshlab nechta mahsulot yetkazib berish kerakligini so'raymiz
      await ctx.reply(
        '📦 *2-mahsulotdan boshlab nechta mahsulot yetkazib berish kerak?*\n\nSonini kiriting (0-9) yoki "Davom etish" tugmasini bosing:',
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([
            [{ text: '⏭ Davom etish' }],
            [{ text: '◀️ Orqaga' }],
          ]).resize(),
        },
      );
      ctx.session.state = 'waiting_product_count';
    } else if (state === 'waiting_additional_location') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.additionalAddress = locationText;
      // Qo'shimcha manzil kiritilgandan keyin yuk og'irligini so'raymiz
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
    } else if (state === 'waiting_additional_location_choice') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.additionalAddress = locationText;
      // Qo'shimcha manzil kiritilgandan keyin yuk og'irligini so'raymiz
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
    } else if (state && state.startsWith('waiting_product_location_')) {
      // Mahsulotlar uchun manzil kiritish
      const productIndex = parseInt(state.split('_')[3]);

      // Ensure session data is properly initialized without overwriting existing data
      if (!ctx.session.orderData) {
        ctx.session.orderData = {};
      }
      if (!ctx.session.orderData.productLocations) {
        ctx.session.orderData.productLocations = {};
      }

      ctx.session.orderData.productLocations[productIndex] = locationText;

      // Keyingi mahsulot manzilini so'raymiz yoki tugatamiz
      const productCount = ctx.session.orderData.productCount || 1;
      if (productIndex < productCount) {
        await ctx.reply(
          `📍 *${
            productIndex + 1
          }-mahsulotni qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring, manzilni yozing yoki "Davom etish" tugmasini bosing:`,
          {
            parse_mode: 'Markdown',
            ...Markup.keyboard([
              [{ text: '📍 Lokatsiyani yuborish', request_location: true }],
              [{ text: '✍️ Manzilni yozish' }],
              [{ text: '⏭ Davom etish' }],
              [{ text: '◀️ Orqaga' }],
            ]).resize(),
          },
        );
        ctx.session.state = `waiting_product_location_${productIndex + 1}`;
      } else {
        // Barcha manzillar kiritildi, endi yuk turi so'raymiz
        ctx.session.state = 'waiting_cargo_type';
        await ctx.reply('📦 *Yuk turini tanlang:*', {
          parse_mode: 'Markdown',
          ...cargoTypeKeyboard(),
        });
      }
    } else if (state && state.startsWith('waiting_product_location_text_')) {
      // Mahsulotlar uchun manzil kiritish (matn sifatida)
      const productIndex = parseInt(state.split('_')[4]);

      // Ensure session data is properly initialized without overwriting existing data
      if (!ctx.session.orderData) {
        ctx.session.orderData = {};
      }
      if (!ctx.session.orderData.productLocations) {
        ctx.session.orderData.productLocations = {};
      }

      ctx.session.orderData.productLocations[productIndex] = locationText;

      // Keyingi mahsulot manzilini so'raymiz yoki tugatamiz
      const productCount = ctx.session.orderData.productCount || 1;
      if (productIndex < productCount) {
        await ctx.reply(
          `📍 *${
            productIndex + 1
          }-mahsulotni qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring, manzilni yozing yoki "Davom etish" tugmasini bosing:`,
          {
            parse_mode: 'Markdown',
            ...Markup.keyboard([
              [{ text: '📍 Lokatsiyani yuborish', request_location: true }],
              [{ text: '✍️ Manzilni yozish' }],
              [{ text: '⏭ Davom etish' }],
              [{ text: '◀️ Orqaga' }],
            ]).resize(),
          },
        );
        ctx.session.state = `waiting_product_location_${productIndex + 1}`;
      } else {
        // Barcha manzillar kiritildi, endi yuk turi so'raymiz
        ctx.session.state = 'waiting_cargo_type';
        await ctx.reply('📦 *Yuk turini tanlang:*', {
          parse_mode: 'Markdown',
          ...cargoTypeKeyboard(),
        });
      }
    }
  }

  async handleWriteAddress(ctx: Context) {
    // Foydalanuvchi manzilini matn sifatida kiritish
    const state = ctx.session?.state;
    if (state === 'waiting_from_location') {
      await ctx.reply(
        "✍️ *Qayerdan olib ketish manzilini yozing:*\n\nMasalan: Toshkent, Amir Temur ko'chasi, 10-uy",
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
      ctx.session.state = 'waiting_from_address_text';
    } else if (state === 'waiting_to_location') {
      await ctx.reply(
        "✍️ *Qayerga yetkazib berish manzilini yozing:*\n\nMasalan: Toshkent, Navoiy ko'chasi, 5-uy",
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
      ctx.session.state = 'waiting_to_address_text';
    } else if (state === 'waiting_additional_location') {
      await ctx.reply(
        "✍️ *Qo‘shimcha manzilni yozing:*\n\nMasalan: Toshkent, Chilonzor ko'chasi, 15-uy",
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
      ctx.session.state = 'waiting_additional_location_text';
    } else if (state && state.startsWith('waiting_product_location_')) {
      const productIndex = parseInt(state.split('_')[3]);
      await ctx.reply(
        `✍️ *${productIndex}-mahsulotni yetkazib berish manzilini yozing:*\n\nMasalan: Toshkent, Navoiy ko'chasi, 5-uy`,
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
      ctx.session.state = `waiting_product_location_text_${productIndex}`;
    }
  }

  async handleCargoType(ctx: Context) {
    // Yuk turini saqlash
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_cargo_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.cargoType = ctx.message.text;
    ctx.session.state = 'waiting_weight';

    await ctx.reply("⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg", {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  }

  async handleTransportType(ctx: Context) {
    // Transport turini saqlash
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_transport_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    const transportType = ctx.message.text;
    ctx.session.orderData.transportType = transportType;

    if (transportType.includes('Gruzovoy')) {
      ctx.session.state = 'waiting_car_type';
      await ctx.reply('🚗 *Mashina turini tanlang:*', {
        parse_mode: 'Markdown',
        ...carTypeKeyboard(),
      });
    } else {
      // Transport turini saqlab, keyin manzil so'raymiz
      ctx.session.state = 'waiting_from_location';
      await ctx.reply(
        '📍 *Qayerdan olib ketish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    }
  }

  async handleCarType(ctx: Context) {
    // Mashina turini saqlash
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_car_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.cargoType = ctx.message.text;
    // Mashina turi tanlangan, endi manzil so'raymiz
    ctx.session.state = 'waiting_from_location';
    await ctx.reply(
      '📍 *Qayerdan olib ketish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
      { parse_mode: 'Markdown', ...locationKeyboard() },
    );
  }

  async handleWeight(ctx: Context) {
    // Yuk og'irligini saqlash
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_weight') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.weight = ctx.message.text;
    ctx.session.state = 'waiting_phone';

    // Transport turi bo'yicha cheklovni aniqlash
    let maxWeight = '';
    const transportType = ctx.session.orderData.transportType || '';
    if (transportType.includes('Peshkom')) {
      maxWeight = '15 kg';
    } else if (transportType.includes('Legkovoy')) {
      maxWeight = '50 kg';
    } else if (transportType.includes('Gruzovoy')) {
      maxWeight = '300 kg';
    } else {
      maxWeight = '50 kg';
    }

    await ctx.reply(
      `📱 *Telefon raqamingizni yuboring:*
      
Cheklov: ${maxWeight} gacha`,
      {
        parse_mode: 'Markdown',
        ...phoneKeyboard(),
      },
    );
  }

  async handlePhone(ctx: Context) {
    // Telefon raqamini saqlash
    if (!ctx.message || !('contact' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_phone') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.phone = ctx.message.contact.phone_number;
    ctx.session.state = 'waiting_comment';

    await ctx.reply('💬 *Izoh qoldiring (ixtiyoriy):*', {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        [{ text: '⏭ O‘tkazib yuborish' }],
        [{ text: '◀️ Orqaga' }],
      ]).resize(),
    });
  }

  async handleWritePhone(ctx: Context) {
    // Telefon raqamini matn sifatida kiritish
    const state = ctx.session?.state;
    if (state === 'waiting_phone') {
      await ctx.reply('📱 *Telefon raqamingizni kiriting:*', {
        parse_mode: 'Markdown',
        ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
      });
      ctx.session.state = 'waiting_phone_text';
    }
  }

  async handleText(ctx: Context, messageText: string) {
    const state = ctx.session?.state;

    if (state === 'waiting_transport_type') {
      await this.handleTransportType(ctx);
    } else if (state === 'waiting_car_type') {
      await this.handleCarType(ctx);
    } else if (state === 'waiting_cargo_type') {
      await this.handleCargoType(ctx);
    } else if (state === 'waiting_weight') {
      await this.handleWeight(ctx);
    } else if (state === 'waiting_phone') {
      await this.handleWritePhone(ctx);
    } else if (state === 'waiting_comment') {
      if (messageText === '⏭ O‘tkazib yuborish') {
        await this.handleSkipComment(ctx);
      } else {
        await this.handleComment(ctx);
      }
    } else if (state === 'waiting_payment_method') {
      await this.handlePaymentMethod(ctx);
    }
  }

  async handleSkipComment(ctx: Context) {
    // Izohni o'tkazib yuborish
    if (ctx.session?.state !== 'waiting_comment') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.comment = '';
    ctx.session.state = 'waiting_payment_method';

    await ctx.reply("💳 *To'lov usulini tanlang:*", {
      parse_mode: 'Markdown',
      ...paymentMethodKeyboard(),
    });
  }

  async handleComment(ctx: Context) {
    // Izoh qoldirish
    if (!ctx.message || !('text' in ctx.message)) return;
    if (
      ctx.session?.state !== 'waiting_comment' &&
      ctx.session?.state !== 'waiting_skip_comment'
    )
      return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.comment = ctx.message.text;
    ctx.session.state = 'waiting_payment_method';

    await ctx.reply("💳 *To'lov usulini tanlang:*", {
      parse_mode: 'Markdown',
      ...paymentMethodKeyboard(),
    });
  }

  async handlePaymentMethod(ctx: Context) {
    // To'lov usulini saqlash
    if (!ctx.message || !('text' in ctx.message) || !ctx.from) return;
    if (ctx.session?.state !== 'waiting_payment_method') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.paymentMethod = ctx.message.text;

    const order = ctx.session.orderData;
    let summary = `
✅ *Buyurtma qabul qilindi!*

📍 *Qayerdan:* ${order.fromAddress}
📍 *Qayerga:* ${order.toAddress}
`;

    // Mahsulotlar manzillarini qo'shamiz
    if (order.productLocations) {
      for (let i = 1; i <= (order.productCount || 1); i++) {
        if (order.productLocations[i]) {
          summary += `📍 *${i}-mahsulot manzili:* ${order.productLocations[i]}\n`;
        }
      }
    }

    if (order.additionalAddress) {
      summary += `📍 *Qo‘shimcha manzil:* ${order.additionalAddress}\n`;
    }

    summary += `📦 *Yuk:* ${order.cargoType}
⚖️ *Og'irlik:* ${order.weight}
🚗 *Transport:* ${order.transportType}
📱 *Telefon:* ${order.phone}
💳 *To'lov usuli:* ${order.paymentMethod}
${order.comment ? `📝 *Izoh:* ${order.comment}` : ''}
    
⏱ *Haydovchi tez orada bog'lanadi!*`;

    await ctx.reply(summary, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });

    // Buyurtmani kanalga yuborish
    await this.orderService.sendOrderToChannel(order, ctx.from.id);

    await this.orderService.saveReview(ctx.from.id, JSON.stringify(order));

    // Buyurtmani database'ga saqlash
    try {
      // Barcha mahsulotlar lokatsiyalarini yig'ish
      let deliveryAddresses = `${order.fromAddress} -> ${order.toAddress}`;
      if (order.productLocations) {
        deliveryAddresses += '\nMahsulotlar:\n';
        for (const [index, location] of Object.entries(
          order.productLocations,
        )) {
          deliveryAddresses += `${index}-mahsulot: ${location}\n`;
        }
      }

      const orderData = {
        userId: ctx.from.id,
        productName: order.cargoType || 'Yetkazib berish',
        quantity: order.productCount || 1,
        deliveryAddress: deliveryAddresses,
        totalPrice: 0, // Narxni hisoblash kerak, hozircha 0
        status: OrderStatus.PENDING,
      };

      await this.ordersService.createOrder(orderData);
    } catch (error) {
      console.error('Error saving order to database:', error);
    }

    ctx.session.state = null;
    ctx.session.orderData = {};
  }
}
