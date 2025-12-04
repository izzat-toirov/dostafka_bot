# Telegram Bot Instructions / Bot ishlatish yo'riqnomasi

## Setup / O'rnatish

1. **Install dependencies / Kutubxonalarni o'rnatish:**
   ```bash
   npm install
   ```

2. **Configure bot token / Bot tokenini sozlash:**
   
   `.env` faylini oching va o'z bot tokeningizni kiriting:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```

   Bot token olish uchun:
   - Telegramda @BotFather ga yozing
   - `/newbot` buyrug'ini yuboring
   - Bot uchun nom kiriting
   - Username kiriting (dostafka_bot kabi)
   - Olingan tokenni `.env` fayliga joylashtiring

3. **Run the bot / Botni ishga tushirish:**
   ```bash
   npm run start:dev
   ```

## Project Structure / Loyiha tuzilishi

```
src/
└── bot/
    ├── bot.module.ts              # Bot moduli
    ├── bot.update.ts              # Bot handlerlari (Start, Hears, Actions)
    ├── keyboards/
    │   └── menu.keyboard.ts       # Keyboard tugmalari
    ├── interfaces/
    │   └── context.interface.ts   # Context va Session interfaceslari
    └── services/
        ├── delivery.service.ts    # Yetkazib berish servisi
        └── order.service.ts       # Buyurtma servisi
```

## Features / Imkoniyatlar

✅ **Buyurtma berish menusi:**
- Биз ҳақимизда (О нас) - Kompaniya haqida ma'lumot
- Мулоқат ўрнатиш (Оставить отзыв) - Fikr-mulohaza qoldirish
- Манзилимиз (Наш адрес) - Manzil ko'rsatish
- Рўйхатдан ўтиш (Регистрация) - Foydalanuvchi ro'yxatdan o'tishi

✅ **Yetkazib berish bo'limi:**
- Manzil kiritish
- Buyurtmalar tarixi
- Narxlar ko'rish

✅ **Sozlamalar:**
- Til tanlash (O'zbekcha/Русский)

## Next Steps / Keyingi qadamlar

1. **Database qo'shish** - Prisma yoki TypeORM orqali ma'lumotlar bazasini qo'shish
2. **Payment integration** - To'lov tizimini integratsiya qilish
3. **Location handling** - Geolokatsiya bilan ishlash
4. **Admin panel** - Admin uchun panel yaratish
5. **Notifications** - Xabarlar yuborish funksiyasi

## Customization / Sozlash

Menuларni o'zgartirish uchun:
- `src/bot/keyboards/menu.keyboard.ts` - Tugmalarni tahrirlash
- `src/bot/bot.update.ts` - Handler funksiyalarini o'zgartirish
- `src/bot/services/` - Biznes logikani yozish
