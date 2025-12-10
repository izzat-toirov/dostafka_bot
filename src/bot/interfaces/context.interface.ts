import { Context as TelegrafContext } from 'telegraf';

export interface SessionData {
  state?: string | null;
  userName?: string;
  userPhone?: string;
  // Buyurtma ma'lumotlari
  orderData?: {
    fromAddress?: string;
    toAddress?: string;
    additionalAddress?: string;
    cargoType?: string;
    transportType?: string;
    weight?: string;
    dimensions?: string;
    phone?: string;
    comment?: string;
    paymentMethod?: string;
    productCount?: number;
    productLocations?: Record<number, string>;
  };
}

export interface Context extends TelegrafContext {
  session: SessionData;
}
