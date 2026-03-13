import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';

export const ORDER_REPOSITORY = 'IOrderRepository';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
}
