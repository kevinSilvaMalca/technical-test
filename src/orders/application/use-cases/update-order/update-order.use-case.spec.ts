import { UpdateOrderUseCase } from './update-order.use-case';
import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { IProductPort, ProductData } from '../../../domain/ports/product-port.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderNotFoundException } from '../../../domain/exceptions/order-not-found.exception';
import { InvalidStatusTransitionException } from '../../../domain/exceptions/invalid-status-transition.exception';

describe('UpdateOrderUseCase', () => {
  let useCase: UpdateOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let productPort: jest.Mocked<IProductPort>;

  const mockProduct: ProductData = {
    id: 'product-1',
    sku: 'IPHONE-15',
    name: 'iPhone 15',
    picture: 'pic.jpg',
    price: 100,
    stock: 20,
  };

  const makeOrder = (status = OrderStatus.PENDING) =>
    new Order({
      id: 'order-1',
      identifier: 'uuid-1234',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      items: [],
      subtotal: 200,
      tax: 20,
      total: 220,
      status,
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
    productPort = {
      getById: jest.fn(),
    };
    useCase = new UpdateOrderUseCase(orderRepository, productPort);
  });

  it('should update allowed fields in pending status', async () => {
    const order = makeOrder();
    const updated = order.withUpdates({ clientName: 'Jane Doe' });
    orderRepository.findById.mockResolvedValue(order);
    orderRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('order-1', {
      clientName: 'Jane Doe',
    });

    expect(result.clientName).toBe('Jane Doe');
  });

  it('should transition pending → confirmed', async () => {
    const order = makeOrder(OrderStatus.PENDING);
    const updated = order.withUpdates({ status: OrderStatus.CONFIRMED });
    orderRepository.findById.mockResolvedValue(order);
    orderRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('order-1', {
      status: OrderStatus.CONFIRMED,
    });

    expect(result.status).toBe(OrderStatus.CONFIRMED);
  });

  it('should transition pending → cancelled', async () => {
    const order = makeOrder(OrderStatus.PENDING);
    const updated = order.withUpdates({ status: OrderStatus.CANCELLED });
    orderRepository.findById.mockResolvedValue(order);
    orderRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('order-1', {
      status: OrderStatus.CANCELLED,
    });

    expect(result.status).toBe(OrderStatus.CANCELLED);
  });

  it('should transition confirmed → shipped', async () => {
    const order = makeOrder(OrderStatus.CONFIRMED);
    const updated = order.withUpdates({ status: OrderStatus.SHIPPED });
    orderRepository.findById.mockResolvedValue(order);
    orderRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('order-1', {
      status: OrderStatus.SHIPPED,
    });

    expect(result.status).toBe(OrderStatus.SHIPPED);
  });

  it('should transition shipped → delivered', async () => {
    const order = makeOrder(OrderStatus.SHIPPED);
    const updated = order.withUpdates({ status: OrderStatus.DELIVERED });
    orderRepository.findById.mockResolvedValue(order);
    orderRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('order-1', {
      status: OrderStatus.DELIVERED,
    });

    expect(result.status).toBe(OrderStatus.DELIVERED);
  });

  it('should throw InvalidStatusTransitionException on delivered → pending', async () => {
    orderRepository.findById.mockResolvedValue(makeOrder(OrderStatus.DELIVERED));

    await expect(
      useCase.execute('order-1', { status: OrderStatus.PENDING }),
    ).rejects.toThrow(InvalidStatusTransitionException);
  });

  it('should throw InvalidStatusTransitionException on cancelled → confirmed', async () => {
    orderRepository.findById.mockResolvedValue(makeOrder(OrderStatus.CANCELLED));

    await expect(
      useCase.execute('order-1', { status: OrderStatus.CONFIRMED }),
    ).rejects.toThrow(InvalidStatusTransitionException);
  });

  it('should throw OrderNotFoundException when order does not exist', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent-id', { clientName: 'Jane' }),
    ).rejects.toThrow(OrderNotFoundException);
  });

  it('should recalculate totals when items change', async () => {
    const order = makeOrder();
    orderRepository.findById.mockResolvedValue(order);
    productPort.getById.mockResolvedValue(mockProduct);
    orderRepository.update.mockImplementation(async (o) => o);

    const result = await useCase.execute('order-1', {
      items: [{ productId: 'product-1', quantity: 3, discount: 0 }],
      tax: 30,
    });

    // lineTotal = 100 * 3 = 300, total = 300 + 30 = 330
    expect(result.subtotal).toBe(300);
    expect(result.total).toBe(330);
  });
});
