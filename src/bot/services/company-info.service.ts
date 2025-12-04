import { Injectable } from '@nestjs/common';

@Injectable()
export class CompanyInfoService {
  // Kompaniya haqida ma'lumot
  getCompanyInfo() {
    return {
      name: 'Dostafka Yetkazib Berish Xizmati',
      founded: 2020,
      description:
        "Biz 2020-yildan beri yetkazib berish xizmatlarini taqdim etamiz. Mijozlarimizning ishonchini qozonib, O'zbekiston bo'ylab o'nlab minglab buyurtmalarni muvaffaqiyatli yetkazib berdik.",
      advantages: [
        'Tez va ishonchli yetkazib berish',
        'Qulay narxlar',
        'Professional haydovchilar',
        "24/7 mijozlarga qo'llab-quvvatlash",
        'Real vaqtda kuzatuv',
      ],
      address: "Toshkent sh., Yunusobod tum., Farobiy ko'chasi, 56-uy",
      phone: '+998901234567',
      website: 'www.dostafka.uz',
    };
  }

  // Bog'lanish uchun ma'lumot
  getContactInfo() {
    return {
      officeAddress: "Toshkent sh., Yunusobod tum., Farobiy ko'chasi, 56-uy",
      phones: [
        '+998901234567 (Operator)',
        "+998901234568 (Mijozlarga xizmat ko'rsatish)",
      ],
      email: 'info@dostafka.uz',
      workHours: 'Dushanba-Yakshanba: 08:00 - 22:00',
      telegram: '@dostafka_support_bot',
    };
  }

  // Kompaniyaning geografik joylashuvi
  getCompanyLocation() {
    return {
      latitude: 41.311081,
      longitude: 69.24057,
      address: "Toshkent sh., Yunusobod tum., Farobiy ko'chasi, 56-uy",
      landmark: 'Metro: "Minor" yoki "Yunusobod"',
      reference: 'Mo\'ljal: "Farobiy" savdo markazi',
    };
  }
}
