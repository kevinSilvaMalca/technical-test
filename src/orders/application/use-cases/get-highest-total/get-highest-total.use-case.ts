import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { Order } from '../../../domain/entities/order.entity';

export class GetHighestTotalUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<Order | null> {
    const orders = await this.orderRepository.findAll();
    if (orders.length === 0) {
      return null;
    }
    return orders.reduce((max, order) =>
      order.total > max.total ? order : max,
    );
  }
}
