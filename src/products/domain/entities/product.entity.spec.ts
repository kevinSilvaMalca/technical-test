import { Product } from './product.entity';
import { ProductStatus } from '../enums/product-status.enum';
import { InvalidPriceException } from '../exceptions/invalid-price.exception';
import { InvalidStockException } from '../exceptions/invalid-stock.exception';

describe('Product Entity', () => {
  const baseProps = {
    id: 'product-1',
    name: 'iPhone 15',
    sku: 'IPHONE-15-128',
    description: 'Apple iPhone 15 128GB',
    picture: 'https://example.com/iphone15.jpg',
    price: 999.99,
    currency: 'USD' as const,
    stock: 50,
    category: 'Smartphones',
    status: ProductStatus.ACTIVE,
    tags: ['apple', 'smartphone'],
  };

  describe('create', () => {
    it('should create a product with all required fields', () => {
      const product = Product.create(baseProps);

      expect(product.id).toBe('product-1');
      expect(product.name).toBe('iPhone 15');
      expect(product.sku).toBe('IPHONE-15-128');
      expect(product.price).toBe(999.99);
      expect(product.currency).toBe('USD');
      expect(product.stock).toBe(50);
      expect(product.category).toBe('Smartphones');
      expect(product.status).toBe(ProductStatus.ACTIVE);
    });

    it('should always set currency to USD', () => {
      const product = Product.create(baseProps);
      expect(product.currency).toBe('USD');
    });

    it('should set createdAt and updatedAt on creation', () => {
      const before = new Date();
      const product = Product.create(baseProps);
      const after = new Date();

      expect(product.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(product.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create product with zero stock', () => {
      const product = Product.create({ ...baseProps, stock: 0 });
      expect(product.stock).toBe(0);
    });

    it('should throw InvalidPriceException when price is zero', () => {
      expect(() => Product.create({ ...baseProps, price: 0 })).toThrow(
        InvalidPriceException,
      );
    });

    it('should throw InvalidPriceException when price is negative', () => {
      expect(() => Product.create({ ...baseProps, price: -10 })).toThrow(
        InvalidPriceException,
      );
    });

    it('should throw InvalidStockException when stock is negative', () => {
      expect(() => Product.create({ ...baseProps, stock: -1 })).toThrow(
        InvalidStockException,
      );
    });
  });

  describe('withUpdates', () => {
    it('should return a new product with updated fields', () => {
      const product = Product.create(baseProps);
      const updated = product.withUpdates({
        name: 'iPhone 15 Pro',
        price: 1199.99,
      });

      expect(updated.name).toBe('iPhone 15 Pro');
      expect(updated.price).toBe(1199.99);
      expect(updated.id).toBe(product.id);
    });

    it('should throw InvalidPriceException when updating with invalid price', () => {
      const product = Product.create(baseProps);
      expect(() => product.withUpdates({ price: 0 })).toThrow(
        InvalidPriceException,
      );
    });

    it('should throw InvalidStockException when updating with negative stock', () => {
      const product = Product.create(baseProps);
      expect(() => product.withUpdates({ stock: -5 })).toThrow(
        InvalidStockException,
      );
    });

    it('should not mutate the original product', () => {
      const product = Product.create(baseProps);
      product.withUpdates({ name: 'Other Phone' });

      expect(product.name).toBe('iPhone 15');
    });

    it('should preserve createdAt when applying updates', () => {
      const product = Product.create(baseProps);
      const updated = product.withUpdates({ name: 'New Name' });

      expect(updated.createdAt).toBe(product.createdAt);
    });
  });
});
