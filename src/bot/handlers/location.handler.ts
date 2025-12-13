import { Context } from '../interfaces/context.interface';
import { OrderHandler } from './order.handler';
import { OrderService } from '../services/order.service';
import {
  mainMenuKeyboard,
  mainMenuKeyboardForRegistered,
  locationKeyboard,
  backButtonKeyboard,
  cargoTypeKeyboard,
} from '../keyboards/menu.keyboard';
import { Markup } from 'telegraf';
import { OrdersService } from '../../orders/orders.service';

export class LocationHandler {
  private readonly orderHandler: OrderHandler;

  constructor(orderService: OrderService, ordersService: OrdersService) {
    this.orderHandler = new OrderHandler(orderService, ordersService);
  }

  // Lokatsiya ma'lumotlarini qabul qilish
  async handleUserLocation(ctx: Context) {
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

      // Mahsulotlar sonini so'raymiz
      await ctx.reply(
        '📦 *Nechta mahsulot yetkazib berish kerak?*\n\nSonini kiriting (1-10):',
        { parse_mode: 'Markdown', ...mainMenuKeyboardForRegistered() },
      );
      ctx.session.state = 'waiting_product_count';
    } else if (state === 'waiting_additional_location') {
      const location = ctx.message.location;
      ctx.session.orderData = {
        ...ctx.session.orderData,
        additionalAddress: `Lokatsiya: ${location.latitude}, ${location.longitude}`,
      };

      // Qo'shimcha manzil kiritilgandan keyin yuk og'irligini so'raymiz
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboardForRegistered() },
      );
    } else if (state === 'waiting_additional_location_choice') {
      const location = ctx.message.location;
      ctx.session.orderData = {
        ...ctx.session.orderData,
        additionalAddress: `Lokatsiya: ${location.latitude}, ${location.longitude}`,
      };

      // Qo'shimcha manzil kiritilgandan keyin yuk og'irligini so'raymiz
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboardForRegistered() },
      );
    } else if (state && state.startsWith('waiting_product_location_')) {
      // Mahsulotlar uchun manzil kiritish
      const productIndex = parseInt(state.split('_')[3]);
      const location = ctx.message.location;
      const locationText = `Lokatsiya: ${location.latitude}, ${location.longitude}`;

      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.productLocations =
        ctx.session.orderData.productLocations || {};
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
      const location = ctx.message.location;
      const locationText = `Lokatsiya: ${location.latitude}, ${location.longitude}`;

      ctx.session.orderData = ctx.session.orderData || {};
      ctx.session.orderData.productLocations =
        ctx.session.orderData.productLocations || {};
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
    } else {
      await this.orderHandler.handleUserLocation(ctx);
    }
  }
}
