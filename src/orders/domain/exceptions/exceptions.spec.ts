import { OrderNotFoundException } from './order-not-found.exception';
import { EmptyOrderException } from './empty-order.exception';
import { InvalidStatusTransitionException } from './invalid-status-transition.exception';
import { InsufficientStockException } from './insufficient-stock.exception';

describe('Order Domain Exceptions', () => {
  it('OrderNotFoundException should have correct message and name', () => {
    const err = new OrderNotFoundException('order-1');
    expect(err.message).toBe("Order with id 'order-1' not found");
    expect(err.name).toBe('OrderNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('EmptyOrderException should have correct message and name', () => {
    const err = new EmptyOrderException();
    expect(err.message).toBe('An order must contain at least one item');
    expect(err.name).toBe('EmptyOrderException');
    expect(err).toBeInstanceOf(Error);
  });

  it('InvalidStatusTransitionException should have correct message and name', () => {
    const err = new InvalidStatusTransitionException('pending', 'delivered');
    expect(err.message).toBe(
      "Cannot transition order status from 'pending' to 'delivered'",
    );
    expect(err.name).toBe('InvalidStatusTransitionException');
    expect(err).toBeInstanceOf(Error);
  });

  it('InsufficientStockException should have correct message and name', () => {
    const err = new InsufficientStockException('IPHONE-15', 10, 3);
    expect(err.message).toContain('IPHONE-15');
    expect(err.message).toContain('10');
    expect(err.message).toContain('3');
    expect(err.name).toBe('InsufficientStockException');
    expect(err).toBeInstanceOf(Error);
  });
});
