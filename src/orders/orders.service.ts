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
    return this.ordersRepository.findOne({ where: { id } });
  }

  async updateOrderStatus(
    id: number,
    status: OrderStatus,
  ): Promise<Order | null> {
    await this.ordersRepository.update(id, { status });
    return this.findOrderById(id);
  }

  async deleteOrder(id: number): Promise<void> {
    await this.ordersRepository.delete(id);
  }
}
