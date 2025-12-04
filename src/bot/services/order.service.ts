import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  async getAboutUs() {
    return `ℹ️ Биз ҳақимизда / О нас

Достафка - энг тез ва ишончли курьер хизмати!

✅ Шаҳар бўйлаб тезкор етказиб бериш
✅ 24/7 қўллаб-қувватлаш
✅ Арзон нархлар
✅ Профессионал курьерлар

Биз билан вақтингизни тежанг! 🚀`;
  }

  async saveReview(userId: number, review: string) {
    // TODO: Save review to database
    console.log(`Review from user ${userId}: ${review}`);
    return true;
  }

  async getAddress() {
    return `📍 Манзилимиз / Наш адрес:

Тошкент шаҳри, Юнусобод тумани
Амир Темур кўчаси, 123-уй

📞 Телефон: +998 90 123 45 67
⏰ Иш вақти: 24/7

Мувофиқ вақтда кутиб қоламиз! 😊`;
  }

  async registerUser(userId: number, name: string, phone: string) {
    // TODO: Save user to database
    console.log(`Registering user: ${userId}, ${name}, ${phone}`);
    return {
      id: userId,
      name,
      phone,
      registeredAt: new Date(),
    };
  }
}
