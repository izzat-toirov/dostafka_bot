import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Telegram bot ilovasini ishga tushirish
async function bootstrap() {
  // NestJS ilovasini yaratish
  const app = await NestFactory.create(AppModule);

  // Ilovani ishga tushirish
  await app.init();

  // Bot ishga tushganligi haqida xabar berish
  console.log('🤖 Telegram bot ishga tushdi!');
}

// Ilovani ishga tushirish
bootstrap();
