import { MongoOrderRepository } from './mongo-order.repository';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { Model } from 'mongoose';
import { OrderDocument } from '../schemas/order.schema';

type OrderModelMock = jest.Mock & {
  findById: jest.Mock;
  find: jest.Mock;
  findByIdAndUpdate: jest.Mock;
};

describe('MongoOrderRepository', () => {
  let repository: MongoOrderRepository;
  let orderModel: OrderModelMock;

  const mockDoc = {
    _id: 'order-1',
    identifier: 'uuid-1234',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    items: [
      {
        productId: 'product-1',
        sku: 'SKU-1',
        name: 'Product 1',
        picture: 'pic.jpg',
        unitPrice: 100,
        quantity: 2,
        discount: 0,
        lineTotal: 200,
      },
    ],
    subtotal: 200,
    tax: 20,
    total: 220,
    status: OrderStatus.PENDING,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    const saveMock = jest.fn().mockResolvedValue(mockDoc);
    const ModelMock = jest.fn().mockImplementation(() => ({ save: saveMock }));

    orderModel = Object.assign(ModelMock, {
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    }) as OrderModelMock;

    repository = new MongoOrderRepository(
      orderModel as unknown as Model<OrderDocument>,
    );
  });

  describe('findById', () => {
    it('should return an Order when found', async () => {
      orderModel.findById.mockResolvedValue(mockDoc);

      const result = await repository.findById('order-1');

      expect(result).toBeInstanceOf(Order);
      expect(result?.identifier).toBe('uuid-1234');
    });

    it('should return null when not found', async () => {
      orderModel.findById.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all orders as domain entities', async () => {
      orderModel.find.mockResolvedValue([mockDoc, mockDoc]);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Order);
    });

    it('should return empty array when no orders exist', async () => {
      orderModel.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByStatus', () => {
    it('should filter orders by status', async () => {
      orderModel.find.mockResolvedValue([mockDoc]);

      const result = await repository.findByStatus(OrderStatus.PENDING);

      expect(orderModel.find).toHaveBeenCalledWith({
        status: OrderStatus.PENDING,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('save', () => {
    it('should save an order and return domain entity', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockDoc);
      orderModel.mockImplementation(() => ({ save: saveMock }));

      const order = new Order({
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

      const result = await repository.save(order);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Order);
    });
  });

  describe('update', () => {
    it('should update an order and return domain entity', async () => {
      orderModel.findByIdAndUpdate.mockResolvedValue(mockDoc);

      const order = new Order({
        id: 'order-1',
        identifier: 'uuid-1234',
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        items: [],
        subtotal: 200,
        tax: 20,
        total: 220,
        status: OrderStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.update(order);

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'order-1',
        expect.any(Object),
        { new: true },
      );
      expect(result).toBeInstanceOf(Order);
    });
  });
});
