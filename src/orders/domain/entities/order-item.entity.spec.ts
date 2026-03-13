import { OrderItem } from './order-item.entity';

describe('OrderItem Entity', () => {
  const baseProps = {
    productId: 'product-1',
    sku: 'IPHONE-15',
    name: 'iPhone 15',
    picture: 'https://example.com/iphone15.jpg',
    unitPrice: 999.99,
    quantity: 2,
    discount: 50,
  };

  it('should create an order item with all fields', () => {
    const item = new OrderItem(baseProps);

    expect(item.productId).toBe('product-1');
    expect(item.sku).toBe('IPHONE-15');
    expect(item.name).toBe('iPhone 15');
    expect(item.unitPrice).toBe(999.99);
    expect(item.quantity).toBe(2);
    expect(item.discount).toBe(50);
  });

  it('should calculate lineTotal as (unitPrice * quantity) - discount', () => {
    const item = new OrderItem(baseProps);
    // (999.99 * 2) - 50 = 1949.98
    expect(item.lineTotal).toBeCloseTo(1949.98, 2);
  });

  it('should calculate lineTotal with no discount', () => {
    const item = new OrderItem({ ...baseProps, discount: 0 });
    // 999.99 * 2 = 1999.98
    expect(item.lineTotal).toBeCloseTo(1999.98, 2);
  });

  it('should calculate lineTotal for single item with discount', () => {
    const item = new OrderItem({
      ...baseProps,
      unitPrice: 100,
      quantity: 1,
      discount: 10,
    });
    // (100 * 1) - 10 = 90
    expect(item.lineTotal).toBe(90);
  });

  it('should calculate lineTotal for multiple items', () => {
    const item = new OrderItem({
      ...baseProps,
      unitPrice: 50,
      quantity: 3,
      discount: 0,
    });
    // 50 * 3 = 150
    expect(item.lineTotal).toBe(150);
  });
});
