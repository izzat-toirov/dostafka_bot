import { Context } from '../interfaces/context.interface';
import {
  mainMenuKeyboard,
  locationKeyboard,
  backButtonKeyboard,
  deliveryTypeKeyboard,
  phoneKeyboard,
  cargoTypeKeyboard,
} from '../keyboards/menu.keyboard';

export class BackHandler {
  // Orqaga qaytish funksiyasi - turli holatlarga mos javob beradi
  async handleBack(ctx: Context) {
    const state = ctx.session?.state;

    // Har bir holat uchun mos javob berish
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
    } else if (state === 'waiting_product_count') {
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (state && state.startsWith('waiting_product_location_')) {
      // Mahsulot manzilini kiritishdan oldin
      const productIndex = parseInt(state.split('_')[3]);
      if (productIndex > 1) {
        // Oldingi mahsulot manzilini so'raymiz
        await ctx.reply(
          `📍 *${productIndex - 1}-mahsulotni qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:`,
          { parse_mode: 'Markdown', ...locationKeyboard() },
        );
        ctx.session.state = `waiting_product_location_${productIndex - 1}`;
      } else {
        // Bosh manzilga qaytamiz
        ctx.session.state = 'waiting_to_location';
        await ctx.reply(
          '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
          { parse_mode: 'Markdown', ...locationKeyboard() },
        );
      }
    } else if (state === 'waiting_cargo_type') {
      // Yuk turini tanlashdan oldin manzilga qaytish
      ctx.session.state = 'waiting_to_location';
      await ctx.reply(
        '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
        { parse_mode: 'Markdown', ...locationKeyboard() },
      );
    } else if (state === 'waiting_weight') {
      // Yuk vaznini kiritishdan oldin yuk turini tanlash
      ctx.session.state = 'waiting_cargo_type';
      await ctx.reply('📦 *Yuk turini tanlang:*', {
        parse_mode: 'Markdown',
        ...cargoTypeKeyboard(),
      });
    } else if (state === 'waiting_transport_type') {
      // Transport turini tanlashdan oldin bosh menyuga qaytish
      ctx.session.state = null;
      ctx.session.orderData = {};
      await ctx.reply('Bosh menyu', mainMenuKeyboard());
    } else if (state === 'waiting_car_type') {
      ctx.session.state = 'waiting_transport_type';
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
    } else if (state === 'waiting_phone') {
      // Telefon raqamini kiritishdan oldin yuk vaznini so'rash
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboard() },
      );
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
      // Manzil kiritishdan oldin transport turini tanlash
      ctx.session.state = 'waiting_transport_type';
      await ctx.reply('🚗 *Transport turini tanlang:*', {
        parse_mode: 'Markdown',
        ...deliveryTypeKeyboard(),
      });
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
    } else if (state && state.startsWith('waiting_product_location_text_')) {
      // Mahsulot manzilini kiritishdan oldin
      const productIndex = parseInt(state.split('_')[4]);
      if (productIndex > 1) {
        // Oldingi mahsulot manzilini so'raymiz
        await ctx.reply(
          `📍 *${productIndex - 1}-mahsulotni qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:`,
          { parse_mode: 'Markdown', ...locationKeyboard() },
        );
        ctx.session.state = `waiting_product_location_${productIndex - 1}`;
      } else {
        // Bosh manzilga qaytamiz
        ctx.session.state = 'waiting_to_location';
        await ctx.reply(
          '📍 *Qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring yoki manzilni yozing:',
          { parse_mode: 'Markdown', ...locationKeyboard() },
        );
      }
    } else if (state === 'waiting_phone_text') {
      ctx.session.state = 'waiting_phone';
      await ctx.reply('📱 *Telefon raqamingizni yuboring:*', {
        parse_mode: 'Markdown',
        ...phoneKeyboard(),
      });
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
}
