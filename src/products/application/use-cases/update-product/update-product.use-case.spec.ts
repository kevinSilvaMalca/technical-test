import { UpdateProductUseCase } from './update-product.use-case';
import { IProductRepository } from '../../../domain/ports/product-repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';
import { DuplicateSkuException } from '../../../domain/exceptions/duplicate-sku.exception';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  const mockProduct = Product.create({
    id: 'product-1',
    name: 'iPhone 15',
    sku: 'IPHONE-15',
    description: 'Apple iPhone 15',
    picture: 'https://example.com/iphone15.jpg',
    price: 999.99,
    currency: 'USD',
    stock: 50,
    category: 'Smartphones',
    status: ProductStatus.ACTIVE,
    tags: [],
  });

  beforeEach(() => {
    productRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateProductUseCase(productRepository);
  });

  it('should update product fields successfully', async () => {
    const updated = mockProduct.withUpdates({ name: 'iPhone 15 Pro' });
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.findBySku.mockResolvedValue(null);
    productRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('product-1', {
      name: 'iPhone 15 Pro',
    });

    expect(result.name).toBe('iPhone 15 Pro');
    expect(productRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should throw ProductNotFoundException when product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent-id', { name: 'New Name' }),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it('should throw DuplicateSkuException when new SKU already exists in another product', async () => {
    const otherProduct = Product.create({
      id: 'product-2',
      name: 'Other',
      sku: 'OTHER-SKU',
      description: 'other',
      picture: 'pic.jpg',
      price: 100,
      currency: 'USD',
      stock: 5,
      category: 'Laptops',
      status: ProductStatus.ACTIVE,
      tags: [],
    });
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.findBySku.mockResolvedValue(otherProduct);

    await expect(
      useCase.execute('product-1', { sku: 'OTHER-SKU' }),
    ).rejects.toThrow(DuplicateSkuException);
  });

  it('should allow updating with the same SKU as the current product', async () => {
    const updated = mockProduct.withUpdates({ price: 1099.99 });
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.findBySku.mockResolvedValue(mockProduct);
    productRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('product-1', {
      sku: 'IPHONE-15',
      price: 1099.99,
    });

    expect(result.price).toBe(1099.99);
  });
});
