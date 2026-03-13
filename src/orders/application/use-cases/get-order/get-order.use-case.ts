import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderNotFoundException } from '../../../domain/exceptions/order-not-found.exception';

export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundException(id);
    }
    return order;
  }
}
