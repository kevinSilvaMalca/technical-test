import { GetOrderUseCase } from './get-order.use-case';
import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderNotFoundException } from '../../../domain/exceptions/order-not-found.exception';

describe('GetOrderUseCase', () => {
  let useCase: GetOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;

  const mockOrder = new Order({
    id: 'order-1',
    identifier: 'uuid-1234',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    items: [],
    subtotal: 200,
    tax: 20,
    total: 220,
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
    useCase = new GetOrderUseCase(orderRepository);
  });

  it('should return order when found', async () => {
    orderRepository.findById.mockResolvedValue(mockOrder);

    const result = await useCase.execute('order-1');

    expect(result).toBe(mockOrder);
    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
  });

  it('should throw OrderNotFoundException when order does not exist', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      OrderNotFoundException,
    );
  });
});
