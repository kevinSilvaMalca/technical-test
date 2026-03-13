import { IOrderRepository } from '../../../domain/ports/order-repository.interface';

export class GetMonthTotalUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<number> {
    const orders = await this.orderRepository.findAll();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return orders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, order) => sum + order.total, 0);
  }
}
