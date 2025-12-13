import { Context } from '../interfaces/context.interface';
import { RegistrationHandler } from './registration.handler';
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

export class TextHandler {
  private readonly orderHandler: OrderHandler;
  private readonly registrationHandler: RegistrationHandler;

  constructor(orderService: OrderService, ordersService: OrdersService) {
    this.orderHandler = new OrderHandler(orderService, ordersService);
    this.registrationHandler = new RegistrationHandler(orderService);
  }

  // Matnli xabarlarga javob berish
  async handleText(ctx: Context, messageText: string) {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;

    const state = ctx.session?.state;

    // Turli holatlarga mos javoblar
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

      // Birinchi mahsulotni avtomatik ravishda saqlaymiz
      ctx.session.orderData.productLocations =
        ctx.session.orderData.productLocations || {};
      ctx.session.orderData.productLocations[1] = messageText;

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
    } else if (state === 'waiting_product_count') {
      // Check if user pressed "Continue" button
      if (messageText === '⏭ Davom etish') {
        // If user presses "Continue" at product count prompt, we need to check if they've already entered a number
        // If they haven't entered a number yet, show error
        ctx.session.orderData = ctx.session.orderData || {};

        // Check if productCount is already set (meaning user previously entered a number)
        if (
          ctx.session.orderData.productCount &&
          ctx.session.orderData.productCount > 1
        ) {
          // User has already entered a number, proceed with that count
          // Check if we have locations for all products except the first one (which is auto-set)
          const productCount = ctx.session.orderData.productCount;
          const productLocations = ctx.session.orderData.productLocations || {};

          // Count how many additional product locations have been entered
          let enteredLocations = 0;
          for (let i = 2; i <= productCount; i++) {
            if (productLocations[i]) {
              enteredLocations++;
            }
          }

          // If we have all locations, proceed to cargo type
          if (enteredLocations >= productCount - 1) {
            ctx.session.state = 'waiting_cargo_type';
            await ctx.reply('📦 *Yuk turini tanlang:*', {
              parse_mode: 'Markdown',
              ...cargoTypeKeyboard(),
            });
          } else {
            // Continue asking for remaining product locations
            // Find the first product without a location
            let nextProductIndex = 2;
            while (
              nextProductIndex <= productCount &&
              productLocations[nextProductIndex]
            ) {
              nextProductIndex++;
            }

            if (nextProductIndex <= productCount) {
              await ctx.reply(
                `📍 *${nextProductIndex}-mahsulotni qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring, manzilni yozing yoki "Davom etish" tugmasini bosing:`,
                {
                  parse_mode: 'Markdown',
                  ...Markup.keyboard([
                    [
                      {
                        text: '📍 Lokatsiyani yuborish',
                        request_location: true,
                      },
                    ],
                    [{ text: '✍️ Manzilni yozish' }],
                    [{ text: '⏭ Davom etish' }],
                    [{ text: '◀️ Orqaga' }],
                  ]).resize(),
                },
              );
              ctx.session.state = `waiting_product_location_${nextProductIndex}`;
            } else {
              // All locations entered, proceed to cargo type
              ctx.session.state = 'waiting_cargo_type';
              await ctx.reply('📦 *Yuk turini tanlang:*', {
                parse_mode: 'Markdown',
                ...cargoTypeKeyboard(),
              });
            }
          }
        } else {
          // User hasn't entered a number yet, show error
          await ctx.reply(
            '❌ *Xato!*\n\nIltimos, avval mahsulotlar sonini kiriting yoki "Orqaga" tugmasini bosing:',
            {
              parse_mode: 'Markdown',
              ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
            },
          );
        }
        return;
      }

      // Mahsulotlar sonini saqlaymiz (0-9 qo'shimcha mahsulotlar)
      const additionalProducts = parseInt(messageText);
      if (
        isNaN(additionalProducts) ||
        additionalProducts < 0 ||
        additionalProducts > 9
      ) {
        await ctx.reply(
          '❌ *Noto\'g\'ri qiymat!*\n\nIltimos, 0 dan 9 gacha son kiriting yoki "Davom etish" tugmasini bosing:',
          {
            parse_mode: 'Markdown',
            ...Markup.keyboard([
              [{ text: '⏭ Davom etish' }],
              [{ text: '◀️ Orqaga' }],
            ]).resize(),
          },
        );
        return;
      }

      ctx.session.orderData = ctx.session.orderData || {};
      // Umumiy mahsulotlar soni = 1 (birinchi mahsulot) + qo'shimcha mahsulotlar soni
      ctx.session.orderData.productCount = 1 + additionalProducts;

      // Agar qo'shimcha mahsulotlar bo'lmasa yoki faqat bitta bo'lsa, darhol yuk turini so'raymiz
      if (additionalProducts <= 1) {
        ctx.session.state = 'waiting_cargo_type';
        await ctx.reply('📦 *Yuk turini tanlang:*', {
          parse_mode: 'Markdown',
          ...cargoTypeKeyboard(),
        });
      } else {
        // Ikkinchi mahsulot uchun manzil so'raymiz yoki davom etish imkonini beramiz
        await ctx.reply(
          '📍 *2-mahsulotni qayerga yetkazib berish kerak?*\n\nLokatsiyani yuboring, manzilni yozing yoki "Davom etish" tugmasini bosing:',
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
        ctx.session.state = 'waiting_product_location_2';
      }
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

      // Agar foydalanuvchi "Davom etish" tugmasini bosgan bo'lsa
      if (messageText === '⏭ Davom etish') {
        // Don't save any location for this product, just move to the next one
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
        return;
      } else if (
        messageText === '✍️ Manzilni yozish' &&
        state &&
        state.startsWith('waiting_product_location_')
      ) {
        const productIndex = parseInt(state.split('_')[3]);
        await ctx.reply(
          `✍️ *${productIndex}-mahsulotni yetkazib berish manzilini yozing:*\n\nMasalan: Toshkent, Navoiy ko'chasi, 5-uy`,
          {
            parse_mode: 'Markdown',
            ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
          },
        );
        ctx.session.state = `waiting_product_location_text_${productIndex}`;
        return;
      }

      // Save the location for this product
      ctx.session.orderData.productLocations[productIndex] = messageText;

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

      // Agar foydalanuvchi "Davom etish" tugmasini bosgan bo'lsa
      if (messageText === '⏭ Davom etish') {
        // Don't save any location for this product, just move to the next one
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
        return;
      }

      // Save the location for this product
      ctx.session.orderData.productLocations[productIndex] = messageText;

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
    } else if (state === 'waiting_additional_location_text') {
      ctx.session.orderData = {
        ...ctx.session.orderData,
        additionalAddress: messageText,
      };

      // Qo'shimcha manzil kiritilgandan keyin yuk og'irligini so'raymiz
      ctx.session.state = 'waiting_weight';
      await ctx.reply(
        "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
        { parse_mode: 'Markdown', ...mainMenuKeyboardForRegistered() },
      );
    } else if (state === 'waiting_additional_location_choice') {
      if (messageText === '⏭ Davom etish') {
        // Qo'shimcha manzil kiritilmagan, endi yuk og'irligini so'raymiz
        ctx.session.state = 'waiting_weight';
        await ctx.reply(
          "⚖️ *Yuk og'irligini kiriting:*\n\nMasalan: 5 kg, 10 kg",
          { parse_mode: 'Markdown', ...mainMenuKeyboardForRegistered() },
        );
      } else if (messageText === '✍️ Qo‘shimcha manzilni yozish') {
        await ctx.reply(
          "✍️ *Qo‘shimcha manzilni yozing:*\n\nMasalan: Toshkent, Chilonzor ko'chasi, 15-uy",
          {
            parse_mode: 'Markdown',
            ...Markup.keyboard([[{ text: '◀️ Orqaga' }]]).resize(),
          },
        );
        ctx.session.state = 'waiting_additional_location_text';
      } else {
        await this.orderHandler.handleText(ctx, messageText);
      }
    } else if (state === 'waiting_phone_text') {
      ctx.session.orderData = {
        ...ctx.session.orderData,
        phone: messageText,
      };
      ctx.session.state = 'waiting_comment';

      await ctx.reply('💬 *Izoh qoldiring (ixtiyoriy):*', {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
          [{ text: '⏭ O‘tkazib yuborish' }],
          [{ text: '◀️ Orqaga' }],
        ]).resize(),
      });
    } else {
      await this.orderHandler.handleText(ctx, messageText);
    }
  }
}
