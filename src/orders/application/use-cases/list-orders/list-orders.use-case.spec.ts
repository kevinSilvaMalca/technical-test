import { ListOrdersUseCase } from './list-orders.use-case';
import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';

describe('ListOrdersUseCase', () => {
  let useCase: ListOrdersUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;

  const makeOrder = (id: string) =>
    new Order({
      id,
      identifier: `uuid-${id}`,
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      items: [],
      subtotal: 100,
      tax: 10,
      total: 110,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    orderRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    useCase = new ListOrdersUseCase(orderRepository);
  });

  it('should return all orders', async () => {
    const orders = [makeOrder('1'), makeOrder('2'), makeOrder('3')];
    orderRepository.findAll.mockResolvedValue(orders);

    const result = await useCase.execute();

    expect(result).toHaveLength(3);
    expect(orderRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no orders exist', async () => {
    orderRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
