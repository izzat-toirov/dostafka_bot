import { Markup } from 'telegraf';

export const mainMenuKeyboard = () => {
  return Markup.keyboard([
    [{ text: 'Buyurtma berish (Заказать курьера)' }],
    [
      { text: 'ℹ️ Biz haqimizda' },
      { text: "📞 Muloqat o'rnatish" },
      { text: '📍 Manzilimiz' },
    ],
    [{ text: '🚚 Yetkazib berish' }, { text: '⚙️ Sozlamalar' }],
    [{ text: "📝 Ro'yxatdan o'tish" }],
  ]).resize();
};

export const deliveryMenuKeyboard = () => {
  return Markup.keyboard([
    [{ text: '📦 Buyurtmalarim' }],
    [{ text: '◀️ Orqaga' }],
  ]).resize();
};

// Yuk turlari
export const cargoTypeKeyboard = () => {
  return Markup.keyboard([
    [{ text: '📦 Hujjatlar / Kichik yuklar' }],
    [{ text: "📦 O'rtacha yuk (gacha 50 kg)" }],
    [{ text: '📦 Katta yuk (50+ kg)' }],
    [{ text: '◀️ Orqaga' }],
  ]).resize();
};

// Yetkazib berish turlari
export const deliveryTypeKeyboard = () => {
  return Markup.keyboard([
    [
      { text: '🚶 Peshkom (15 kg gacha)' },
      { text: '🚗 Legkovoy avtomobil (50 kg gacha)' },
    ],
    [{ text: '🚚 Gruzovoy transport' }],
    [{ text: '◀️ Orqaga' }],
  ]).resize();
};

// Mashina turlari
export const carTypeKeyboard = () => {
  return Markup.keyboard([
    [{ text: '🚙 Djip/Pikap do 2 m3, 500 kg' }],
    [{ text: '🚙 Kabluk do 3.2 m3, 700 kg' }],
    [{ text: '🚚 Porter do 8 m3, 1000 kg' }],
    [{ text: '🚚 Gazel do 17 m3, 1500 kg' }],
    [{ text: '✍️ Raqamni yozish' }, { text: '◀️ Orqaga' }],
  ]).resize();
};

// Lokatsiya yuborish keyboard
export const locationKeyboard = () => {
  return Markup.keyboard([
    [{ text: '📍 Lokatsiyani yuborish', request_location: true }],
    [{ text: '✍️ Manzilni yozish' }],
    [{ text: '◀️ Orqaga' }],
  ]).resize();
};

// Telefon raqam yuborish keyboard
export const phoneKeyboard = () => {
  return Markup.keyboard([
    [
      { text: '📱 Telefon raqamni yuborish', request_contact: true },
      { text: '✍️ Raqamni yozish' },
    ],
    [{ text: '◀️ Orqaga' }],
  ]).resize();
};

// To'lov usuli keyboard
export const paymentMethodKeyboard = () => {
  return Markup.keyboard([
    [{ text: "💳 Karta orqali to'lash" }],
    [{ text: '💵 Naqd pul' }],
    [{ text: '◀️ Orqaga' }],
  ]).resize();
};
