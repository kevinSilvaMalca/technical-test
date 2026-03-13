import { CreateProductUseCase } from './create-product.use-case';
import { IProductRepository } from '../../../domain/ports/product-repository.interface';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { Product } from '../../../domain/entities/product.entity';
import { DuplicateSkuException } from '../../../domain/exceptions/duplicate-sku.exception';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  const baseInput = {
    name: 'iPhone 15',
    sku: 'IPHONE-15',
    description: 'Apple iPhone 15',
    picture: 'https://example.com/iphone15.jpg',
    price: 999.99,
    stock: 50,
    category: 'Smartphones',
    status: ProductStatus.ACTIVE,
    tags: ['apple'],
  };

  const makeProduct = () =>
    Product.create({ ...baseInput, id: 'product-1', currency: 'USD' });

  beforeEach(() => {
    productRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateProductUseCase(productRepository);
  });

  it('should create a product successfully', async () => {
    productRepository.findBySku.mockResolvedValue(null);
    productRepository.save.mockResolvedValue(makeProduct());

    const result = await useCase.execute(baseInput);

    expect(result.name).toBe('iPhone 15');
    expect(productRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw DuplicateSkuException when SKU already exists', async () => {
    productRepository.findBySku.mockResolvedValue(makeProduct());

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      DuplicateSkuException,
    );
  });

  it('should check SKU before saving', async () => {
    productRepository.findBySku.mockResolvedValue(null);
    productRepository.save.mockResolvedValue(makeProduct());

    await useCase.execute(baseInput);

    expect(productRepository.findBySku).toHaveBeenCalledWith('IPHONE-15');
    expect(productRepository.save).toHaveBeenCalledTimes(1);
  });
});
