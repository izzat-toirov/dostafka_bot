import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryService {
  async createDelivery(userId: number, from: string, to: string) {
    // TODO: Implement delivery creation logic
    console.log(`Creating delivery for user ${userId} from ${from} to ${to}`);
    return {
      id: Date.now(),
      userId,
      from,
      to,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  async getUserDeliveries(userId: number) {
    // TODO: Implement get user deliveries logic
    console.log(`Getting deliveries for user ${userId}`);
    return [];
  }

  async getPricing() {
    return `💰 Bizning narxlar:

📍 Shahar ichida:
  • 0-5 km: 15,000 so'm
  • 5-10 km: 25,000 so'm
  • 10+ km: 35,000 so'm

📍 Shahar tashqarisiga:
  • Kelishiladi

⏰ Tezkor yetkazib berish: +10,000 so'm`;
  }
}
