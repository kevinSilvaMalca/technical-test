import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { EmptyOrderException } from '../exceptions/empty-order.exception';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';

describe('Order Entity', () => {
  const baseItem = {
    productId: 'product-1',
    sku: 'IPHONE-15',
    name: 'iPhone 15',
    picture: 'https://example.com/iphone15.jpg',
    unitPrice: 100,
    quantity: 2,
    discount: 0,
  };

  const createOrderProps = {
    id: 'order-1',
    identifier: 'uuid-1234',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    items: [baseItem],
    tax: 20,
  };

  describe('create', () => {
    it('should create an order with status pending', () => {
      const order = Order.create(createOrderProps);
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should calculate subtotal as sum of lineTotals', () => {
      const order = Order.create({
        ...createOrderProps,
        items: [
          { ...baseItem, unitPrice: 100, quantity: 2, discount: 0 },
          {
            ...baseItem,
            productId: 'product-2',
            sku: 'SKU-2',
            unitPrice: 50,
            quantity: 1,
            discount: 5,
          },
        ],
      });
      // item1: 100*2 - 0 = 200, item2: 50*1 - 5 = 45
      expect(order.subtotal).toBeCloseTo(245, 2);
    });

    it('should calculate total as subtotal + tax', () => {
      const order = Order.create({
        ...createOrderProps,
        items: [{ ...baseItem, unitPrice: 100, quantity: 2, discount: 0 }],
        tax: 20,
      });
      // subtotal = 200, tax = 20, total = 220
      expect(order.subtotal).toBe(200);
      expect(order.tax).toBe(20);
      expect(order.total).toBe(220);
    });

    it('should calculate lineTotal correctly with discount', () => {
      const order = Order.create({
        ...createOrderProps,
        items: [{ ...baseItem, unitPrice: 100, quantity: 3, discount: 30 }],
        tax: 0,
      });
      // lineTotal = (100 * 3) - 30 = 270
      expect(order.subtotal).toBe(270);
      expect(order.items[0].lineTotal).toBe(270);
    });

    it('should throw EmptyOrderException when items is empty', () => {
      expect(() => Order.create({ ...createOrderProps, items: [] })).toThrow(
        EmptyOrderException,
      );
    });

    it('should set createdAt and updatedAt on creation', () => {
      const before = new Date();
      const order = Order.create(createOrderProps);
      const after = new Date();

      expect(order.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(order.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow pending → confirmed', () => {
      const order = Order.create(createOrderProps);
      expect(() =>
        order.validateStatusTransition(OrderStatus.CONFIRMED),
      ).not.toThrow();
    });

    it('should allow pending → cancelled', () => {
      const order = Order.create(createOrderProps);
      expect(() =>
        order.validateStatusTransition(OrderStatus.CANCELLED),
      ).not.toThrow();
    });

    it('should throw when transitioning from delivered', () => {
      const order = new Order({
        ...createOrderProps,
        items: [{ ...baseItem, lineTotal: 200 } as unknown as OrderItem],
        subtotal: 200,
        total: 220,
        status: OrderStatus.DELIVERED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(() => order.validateStatusTransition(OrderStatus.PENDING)).toThrow(
        InvalidStatusTransitionException,
      );
    });

    it('should throw when transitioning from cancelled', () => {
      const order = new Order({
        ...createOrderProps,
        items: [{ ...baseItem, lineTotal: 200 } as unknown as OrderItem],
        subtotal: 200,
        total: 220,
        status: OrderStatus.CANCELLED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(() =>
        order.validateStatusTransition(OrderStatus.CONFIRMED),
      ).toThrow(InvalidStatusTransitionException);
    });

    it('should throw on invalid transition shipped → pending', () => {
      const order = new Order({
        ...createOrderProps,
        items: [{ ...baseItem, lineTotal: 200 } as unknown as OrderItem],
        subtotal: 200,
        total: 220,
        status: OrderStatus.SHIPPED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(() => order.validateStatusTransition(OrderStatus.PENDING)).toThrow(
        InvalidStatusTransitionException,
      );
    });
  });

  describe('withUpdates', () => {
    it('should update clientName and clientEmail', () => {
      const order = Order.create(createOrderProps);
      const updated = order.withUpdates({
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
      });

      expect(updated.clientName).toBe('Jane Doe');
      expect(updated.clientEmail).toBe('jane@example.com');
      expect(updated.id).toBe(order.id);
    });

    it('should recalculate totals when items change', () => {
      const order = Order.create(createOrderProps);
      const updated = order.withUpdates({
        items: [{ ...baseItem, unitPrice: 200, quantity: 1, discount: 0 }],
        tax: 20,
      });

      expect(updated.subtotal).toBe(200);
      expect(updated.total).toBe(220);
    });

    it('should allow pending → confirmed transition', () => {
      const order = Order.create(createOrderProps);
      const updated = order.withUpdates({ status: OrderStatus.CONFIRMED });
      expect(updated.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw on invalid status transition', () => {
      const order = Order.create(createOrderProps);
      expect(() =>
        order.withUpdates({ status: OrderStatus.DELIVERED }),
      ).toThrow(InvalidStatusTransitionException);
    });

    it('should throw EmptyOrderException when updating with empty items', () => {
      const order = Order.create(createOrderProps);
      expect(() => order.withUpdates({ items: [] })).toThrow(
        EmptyOrderException,
      );
    });

    it('should not mutate the original order', () => {
      const order = Order.create(createOrderProps);
      order.withUpdates({ clientName: 'Other Name' });
      expect(order.clientName).toBe('John Doe');
    });
  });
});
