import { GetHighestTotalUseCase } from './get-highest-total.use-case';
import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';

describe('GetHighestTotalUseCase', () => {
  let useCase: GetHighestTotalUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;

  const makeOrder = (id: string, total: number) =>
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
    useCase = new GetHighestTotalUseCase(orderRepository);
  });

  it('should return the order with the highest total', async () => {
    const orders = [
      makeOrder('1', 100),
      makeOrder('2', 500),
      makeOrder('3', 250),
    ];
    orderRepository.findAll.mockResolvedValue(orders);

    const result = await useCase.execute();

    expect(result?.id).toBe('2');
    expect(result?.total).toBe(500);
  });

  it('should return null when no orders exist', async () => {
    orderRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toBeNull();
  });

  it('should return the single order when only one exists', async () => {
    orderRepository.findAll.mockResolvedValue([makeOrder('1', 150)]);

    const result = await useCase.execute();

    expect(result?.id).toBe('1');
  });
});
