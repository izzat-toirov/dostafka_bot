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

export class OrderHandler {
  constructor(private readonly orderService: OrderService) {}

  async handleOrderDelivery(ctx: Context) {
    ctx.session.orderData = {};
    ctx.session.state = 'waiting_from_location';
    await ctx.reply(
      '📍 *Qayerdan olib ketish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
      { parse_mode: 'Markdown', ...locationKeyboard() },
    );
  }

  async handleWriteAddress(ctx: Context) {
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
    }
  }

  async handleCargoType(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_cargo_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.cargoType = ctx.message.text;
    ctx.session.state = 'waiting_phone';

    // Get the weight limit based on transport type
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

  async handleTransportType(ctx: Context) {
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
      // Go to weight entry first, then phone
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
    }
  }

  async handleCarType(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    if (ctx.session?.state !== 'waiting_car_type') return;

    ctx.session.orderData = ctx.session.orderData || {};
    ctx.session.orderData.transportType += ` - ${ctx.message.text}`;
    // Go to weight entry first, then phone
    ctx.session.state = 'waiting_weight';
    await ctx.reply("⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg", {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(),
    });
  }

  async handleWritePhone(ctx: Context) {
    const state = ctx.session?.state;

    if (state === 'waiting_car_type') {
      await ctx.reply(
        '✍️ *Telefon raqamingizni yozing:*\\n\\nMasalan: +998901234567',
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
      ctx.session.state = 'waiting_phone_text_car';
    } else if (state === 'waiting_phone') {
      await ctx.reply(
        '✍️ *Telefon raqamingizni yozing:*\\n\\nMasalan: +998901234567',
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
      ctx.session.state = 'waiting_phone_text';
    }
  }

  async handleText(ctx: Context, messageText: string) {
    if (!ctx.from) return;

    const state = ctx.session?.state;

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
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.additionalAddress = messageText;
      ctx.session.state = 'waiting_transport_type';
      // Show only transport type selection
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
      }
    } else if (state === 'waiting_weight') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.weight = messageText;
      ctx.session.state = 'waiting_cargo_type';
      await ctx.reply('📦 *Yuk turini tanlang:*', {
        parse_mode: 'Markdown',
        ...cargoTypeKeyboard(),
      });
    } else if (state === 'waiting_comment') {
      ctx.session.orderData = ctx.session.orderData || {};
      if (messageText.toLowerCase() !== "yo'q") {
        ctx.session.orderData.comment = messageText;
      }

      ctx.session.state = 'waiting_payment_method';
      await ctx.reply("💳 *To'lov usulini tanlang:*", {
        parse_mode: 'Markdown',
        ...paymentMethodKeyboard(),
      });
    } else if (state === 'waiting_payment_method') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.paymentMethod = messageText;

      const order = ctx.session.orderData;
      let summary = `
✅ *Buyurtma qabul qilindi!*

📍 *Qayerdan:* ${order.fromAddress}
📍 *Qayerga:* ${order.toAddress}
`;

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

      await this.orderService.saveReview(ctx.from.id, JSON.stringify(order));

      ctx.session.state = null;
      ctx.session.orderData = {};
    } else if (state === 'waiting_phone_text') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.phone = messageText;
      ctx.session.state = 'waiting_comment';
      await ctx.reply(
        '📝 *Qo\'shimcha izoh (ixtiyoriy):*\n\nYoki "Yo\'q" deb yuboring:',
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
    } else if (state === 'waiting_phone_text_car') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.phone = messageText;
      ctx.session.state = 'waiting_comment';
      await ctx.reply(
        '📝 *Qo\'shimcha izoh (ixtiyoriy):*\n\nYoki "Yo\'q" deb yuboring:',
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
    }
  }

  async handleUserContact(ctx: Context) {
    if (!ctx.from || !ctx.message || !('contact' in ctx.message)) return;

    const state = ctx.session?.state;
    if (state === 'waiting_phone') {
      const phone = ctx.message.contact.phone_number;
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.phone = phone;
      ctx.session.state = 'waiting_comment';
      await ctx.reply(
        '📝 *Qo\'shimcha izoh (ixtiyoriy):*\n\nYoki "Yo\'q" deb yuboring:',
        {
          parse_mode: 'Markdown',
          ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
        },
      );
    }
  }

  async handleUserLocation(ctx: Context) {
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
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.additionalAddress = locationText;
      ctx.session.state = 'waiting_transport_type';
      // Show only transport type selection
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_additional_location_choice') {
      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.additionalAddress = locationText;
      ctx.session.state = 'waiting_transport_type';
      // Show only transport type selection
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    }
  }
}
