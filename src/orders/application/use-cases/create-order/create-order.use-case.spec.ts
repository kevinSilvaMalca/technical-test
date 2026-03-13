import { CreateOrderUseCase } from './create-order.use-case';
import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import {
  IProductPort,
  ProductData,
} from '../../../domain/ports/product-port.interface';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { EmptyOrderException } from '../../../domain/exceptions/empty-order.exception';
import { InsufficientStockException } from '../../../domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from '../../../../products/domain/exceptions/product-not-found.exception';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let productPort: jest.Mocked<IProductPort>;

  const mockProduct: ProductData = {
    id: 'product-1',
    sku: 'IPHONE-15',
    name: 'iPhone 15',
    picture: 'https://example.com/iphone15.jpg',
    price: 100,
    stock: 20,
  };

  const baseInput = {
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    items: [{ productId: 'product-1', quantity: 2, discount: 0 }],
    tax: 20,
  };

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
    useCase = new CreateOrderUseCase(orderRepository, productPort);
  });

  it('should create an order with correct totals', async () => {
    productPort.getById.mockResolvedValue(mockProduct);
    orderRepository.save.mockImplementation((order) => Promise.resolve(order));

    const result = await useCase.execute(baseInput);

    // lineTotal = (100 * 2) - 0 = 200, total = 200 + 20 = 220
    expect(result.subtotal).toBe(200);
    expect(result.tax).toBe(20);
    expect(result.total).toBe(220);
    expect(result.status).toBe(OrderStatus.PENDING);
  });

  it('should calculate lineTotal correctly with discount', async () => {
    productPort.getById.mockResolvedValue(mockProduct);
    orderRepository.save.mockImplementation((order) => Promise.resolve(order));

    const result = await useCase.execute({
      ...baseInput,
      items: [{ productId: 'product-1', quantity: 3, discount: 30 }],
      tax: 0,
    });

    // lineTotal = (100 * 3) - 30 = 270
    expect(result.subtotal).toBe(270);
    expect(result.items[0].lineTotal).toBe(270);
  });

  it('should throw EmptyOrderException when items list is empty', async () => {
    await expect(useCase.execute({ ...baseInput, items: [] })).rejects.toThrow(
      EmptyOrderException,
    );
  });

  it('should throw ProductNotFoundException when product does not exist', async () => {
    productPort.getById.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it('should throw InsufficientStockException when stock is not enough', async () => {
    productPort.getById.mockResolvedValue({ ...mockProduct, stock: 1 });

    await expect(
      useCase.execute({
        ...baseInput,
        items: [{ productId: 'product-1', quantity: 5, discount: 0 }],
      }),
    ).rejects.toThrow(InsufficientStockException);
  });

  it('should set status to pending on creation', async () => {
    productPort.getById.mockResolvedValue(mockProduct);
    orderRepository.save.mockImplementation((order) => Promise.resolve(order));

    const result = await useCase.execute(baseInput);

    expect(result.status).toBe(OrderStatus.PENDING);
  });

  it('should generate a UUID identifier', async () => {
    productPort.getById.mockResolvedValue(mockProduct);
    orderRepository.save.mockImplementation((order) => Promise.resolve(order));

    const result = await useCase.execute(baseInput);

    expect(result.identifier).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
