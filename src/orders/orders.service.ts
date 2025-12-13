import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.ordersRepository.create(orderData);
    return this.ordersRepository.save(order);
  }

  async findAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  async findOrderById(id: number): Promise<Order | null> {
    // createQueryBuilder dan foydalanish
    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.id = :id', { id: id.toString() })
      .getOne();
  }

  async updateOrderStatus(
    id: number,
    status: OrderStatus,
  ): Promise<Order | null> {
    // id ni string sifatida konvert qilish
    await this.ordersRepository
      .createQueryBuilder()
      .update(Order)
      .set({
        status,
        isActive: status === OrderStatus.CONFIRMED ? true : false,
      })
      .where('id = :id', { id: id.toString() })
      .execute();

    return this.findOrderById(id);
  }

  async deleteOrder(id: number): Promise<void> {
    await this.ordersRepository
      .createQueryBuilder()
      .delete()
      .from(Order)
      .where('id = :id', { id: id.toString() })
      .execute();
  }

  // Barcha buyurtmalarni o'chirish
  async deleteAllOrders(): Promise<void> {
    await this.ordersRepository
      .createQueryBuilder()
      .delete()
      .from(Order)
      .execute();
  }
}
