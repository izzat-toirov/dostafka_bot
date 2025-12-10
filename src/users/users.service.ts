import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    telegramId: number,
    name: string,
    phone: string,
    email?: string,
  ): Promise<User> {
    const user = this.usersRepository.create({
      telegramId,
      name,
      phone,
      email,
    });
    return this.usersRepository.save(user);
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { telegramId } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
