import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { Order } from '../../../domain/entities/order.entity';

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
