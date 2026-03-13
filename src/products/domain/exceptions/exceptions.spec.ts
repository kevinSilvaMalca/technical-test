import { ProductNotFoundException } from './product-not-found.exception';
import { DuplicateSkuException } from './duplicate-sku.exception';
import { InvalidPriceException } from './invalid-price.exception';
import { InvalidStockException } from './invalid-stock.exception';

describe('Product Domain Exceptions', () => {
  it('ProductNotFoundException should have correct message and name', () => {
    const err = new ProductNotFoundException('prod-1');
    expect(err.message).toBe("Product with id 'prod-1' not found");
    expect(err.name).toBe('ProductNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('DuplicateSkuException should have correct message and name', () => {
    const err = new DuplicateSkuException('IPHONE-15');
    expect(err.message).toBe("Product with SKU 'IPHONE-15' already exists");
    expect(err.name).toBe('DuplicateSkuException');
    expect(err).toBeInstanceOf(Error);
  });

  it('InvalidPriceException should have correct message and name', () => {
    const err = new InvalidPriceException(-5);
    expect(err.message).toContain('-5');
    expect(err.name).toBe('InvalidPriceException');
    expect(err).toBeInstanceOf(Error);
  });

  it('InvalidStockException should have correct message and name', () => {
    const err = new InvalidStockException(-3);
    expect(err.message).toContain('-3');
    expect(err.name).toBe('InvalidStockException');
    expect(err).toBeInstanceOf(Error);
  });
});
