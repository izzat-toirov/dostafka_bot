# Dostafka Telegram Bot - Yo'riqnoma

## O'rnatish

1. **Kutubxonalarni o'rnatish:**

   ```bash
   npm install
   ```

2. **Bot tokenini sozlash:**

   `.env` fayliga o'z bot tokeningizni kiriting:

   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```

   Bot token olish uchun:
   - Telegramda @BotFather ga yozing
   - `/newbot` buyrug'ini yuboring
   - Bot uchun nom kiriting
   - Username kiriting (dostafka_bot kabi)
   - Olingan tokenni `.env` fayliga joylashtiring

3. **Botni ishga tushirish:**
   ```bash
   npm run start:dev
   ```

## Loyiha tuzilishi

```
src/
├── main.ts                 # Asosiy kirish nuqtasi
├── app.module.ts           # Asosiy modul
└── bot/
    ├── bot.module.ts       # Bot moduli
    ├── bot.update.ts       # Telegram xabarlarini qayta ishlash
    ├── keyboards/
    │   └── menu.keyboard.ts # Tugmalar
    ├── handlers/
    │   ├── order.handler.ts  # Buyurtma bilan ishlash
    │   ├── info.handler.ts   # Ma'lumotlar bilan ishlash
    │   └── registration.handler.ts # Ro'yxatdan o'tish
    ├── interfaces/
    │   └── context.interface.ts # Kontekst interfeysi
    └── services/
        ├── delivery.service.ts   # Yetkazib berish servisi
        ├── order.service.ts      # Buyurtma servisi
        └── company-info.service.ts # Kompaniya ma'lumotlari
```

## Asosiy imkoniyatlar

✅ **Buyurtma berish:**

- Yetkazib berish manzilini kiritish
- Yuk turi va vaznini tanlash
- Transport turini tanlash
- Bog'lanish uchun telefon raqam

✅ **Ma'lumotlar bo'limi:**

- Kompaniya haqida ma'lumot
- Aloqa ma'lumotlari
- Kompaniya manzili (geolokatsiya bilan)

✅ **Ro'yxatdan o'tish:**

- Ism va telefon raqam orqali ro'yxatdan o'tish

✅ **Sozlamalar:**

- Til tanlash (O'zbekcha/Ruscha)

## Keyingi qadamlar

1. **Ma'lumotlar bazasini qo'shish** - Buyurtmalar va foydalanuvchilarni saqlash uchun
2. **To'lov tizimini integratsiya qilish** - Buyurtma to'lovini amalga oshirish
3. **Admin panel yaratish** - Buyurtmalarni boshqarish uchun
4. **Xabarlar yuborish funksiyasi** - Foydalanuvchilarga yangiliklar yuborish

## Sozlash

Menyularni o'zgartirish uchun:

- `src/bot/keyboards/menu.keyboard.ts` - Tugmalarni tahrirlash
- `src/bot/bot.update.ts` - Xabarlar bilan ishlash
- `src/bot/handlers/` - Mantiqni kengaytirish
- `src/bot/services/` - Biznes logikani yozish
