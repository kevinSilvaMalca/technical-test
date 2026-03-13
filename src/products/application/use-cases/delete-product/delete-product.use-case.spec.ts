import { DeleteProductUseCase } from './delete-product.use-case';
import { IProductRepository } from '../../../domain/ports/product-repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
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
    useCase = new DeleteProductUseCase(productRepository);
  });

  it('should delete a product successfully', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('product-1');

    expect(productRepository.delete).toHaveBeenCalledWith('product-1');
  });

  it('should throw ProductNotFoundException when product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      ProductNotFoundException,
    );
    expect(productRepository.delete).not.toHaveBeenCalled();
  });
});
