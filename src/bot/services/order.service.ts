import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  // Biz haqimizda ma'lumotni qaytarish
  async getAboutUs() {
    return `ℹ️ Биз ҳақимизда / О нас

Достафка - энг тез ва ишончли курьер хизмати!

✅ Шаҳар бўйлаб тезкор етказиб бериш
✅ 24/7 қўллаб-қувватлаш
✅ Арзон нархлар
✅ Профессионал курьерлар

Биз билан вақтингизни тежанг! 🚀`;
  }

  // Foydalanuvchi sharhini saqlash
  async saveReview(userId: number, review: string) {
    // TODO: Save review to database
    console.log(`Review from user ${userId}: ${review}`);
    return true;
  }

  // Kompaniya manzilini qaytarish
  async getAddress() {
    return `📍 Манзилимиз / Наш адрес:

Тошкент шаҳри, Юнусобод тумани
Амир Темур кўчаси, 123-уй

📞 Телефон: +998 90 123 45 67
⏰ Иш вақти: 24/7

Мувофиқ вақтда кутиб қоламиз! 😊`;
  }

  // Foydalanuvchini ro'yxatdan o'tkazish
  async registerUser(userId: number, name: string, phone: string) {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByPhone(phone);
      if (existingUser) {
        console.log(`User with phone ${phone} already exists`);
        return existingUser;
      }

      // Create new user
      const user = await this.usersService.create(userId, name, phone);
      console.log(`Registered user: ${userId}, ${name}, ${phone}`);
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Buyurtmani kanalga yuborish
  async sendOrderToChannel(orderData: any, userId: number) {
    try {
      // Foydalanuvchi ma'lumotlarini olish
      let user: User | null = await this.usersService.findByTelegramId(userId);
      if (!user) {
        // Agar foydalanuvchi topilmasa, uni qidirish
        console.log(`User with telegramId ${userId} not found in database`);
        // Placeholder user object
        user = {
          id: 0,
          telegramId: userId,
          name: 'Unknown User',
          phone: orderData.phone || 'Unknown',
          email: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        } as User;
      }

      // Kanal ID ni olish
      const channelId = this.configService.get('ORDERS_CHANNEL_ID');
      if (!channelId) {
        console.error('ORDERS_CHANNEL_ID not configured in environment variables');
        return;
      }

      // Buyurtma ma'lumotlarini formatlash
      let orderMessage = `
📦 *Yangi buyurtma*

👤 *Foydalanuvchi:* ${user.name}
📱 *Telefon:* ${user.phone || orderData.phone}
🆔 *Telegram ID:* ${userId}

📍 *Qayerdan:* ${orderData.fromAddress}
📍 *Qayerga:* ${orderData.toAddress}
`;

      // Mahsulotlar manzillarini qo'shish
      if (orderData.productLocations) {
        for (let i = 1; i <= (orderData.productCount || 1); i++) {
          if (orderData.productLocations[i]) {
            orderMessage += `📍 *${i}-mahsulot manzili:* ${orderData.productLocations[i]}\n`;
          }
        }
      }

      if (orderData.additionalAddress) {
        orderMessage += `📍 *Qo‘shimcha manzil:* ${orderData.additionalAddress}\n`;
      }

      orderMessage += `📦 *Yuk:* ${orderData.cargoType}
⚖️ *Og'irlik:* ${orderData.weight}
🚗 *Transport:* ${orderData.transportType}
💳 *To'lov usuli:* ${orderData.paymentMethod}
${orderData.comment ? `📝 *Izoh:* ${orderData.comment}` : ''}
`;

      // Kanalga xabar yuborish
      const botToken = this.configService.get('BOT_TOKEN');
      if (botToken) {
        const bot = new Telegraf(botToken);
        // Buyurtma ID generatsiya qilish (vaqt tamg'asi bo'yicha)
        const orderId = Date.now().toString();
        
        // Tugmachalar bilan xabar yuborish
        await bot.telegram.sendMessage(channelId, orderMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Qabul qilish', callback_data: `accept_${orderId}_${userId}` },
                { text: '❌ Qabul qilmaslik', callback_data: `reject_${orderId}_${userId}` }
              ]
            ]
          }
        });
        console.log('Order sent to channel successfully with buttons');
      } else {
        console.error('BOT_TOKEN not found in environment variables');
      }
    } catch (error) {
      console.error('Error sending order to channel:', error);
    }
  }
}