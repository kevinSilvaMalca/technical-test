import { GetMonthTotalUseCase } from './get-month-total.use-case';
import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';

describe('GetMonthTotalUseCase', () => {
  let useCase: GetMonthTotalUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;

  const now = new Date();
  const makeOrder = (id: string, total: number, date: Date) =>
    new Order({
      id,
      identifier: `uuid-${id}`,
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      items: [],
      subtotal: total - 10,
      tax: 10,
      total,
      status: OrderStatus.PENDING,
      createdAt: date,
      updatedAt: date,
    });

  beforeEach(() => {
    orderRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    useCase = new GetMonthTotalUseCase(orderRepository);
  });

  it('should sum totals of orders in the current month', async () => {
    const orders = [
      makeOrder('1', 100, now),
      makeOrder('2', 200, now),
      makeOrder('3', 50, now),
    ];
    orderRepository.findAll.mockResolvedValue(orders);

    const result = await useCase.execute();

    expect(result).toBe(350);
  });

  it('should return 0 when no orders exist', async () => {
    orderRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toBe(0);
  });

  it('should exclude orders from previous months', async () => {
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const orders = [
      makeOrder('1', 100, now),
      makeOrder('2', 999, lastMonth),
    ];
    orderRepository.findAll.mockResolvedValue(orders);

    const result = await useCase.execute();

    expect(result).toBe(100);
  });
});
