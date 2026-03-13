import { SearchProductsUseCase } from './search-products.use-case';
import { IProductRepository, PaginatedProducts } from '../../../domain/ports/product-repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';

describe('SearchProductsUseCase', () => {
  let useCase: SearchProductsUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  const makeProduct = (id: string, price: number, category: string) =>
    Product.create({
      id,
      name: `Product ${id}`,
      sku: `SKU-${id}`,
      description: 'desc',
      picture: 'pic.jpg',
      price,
      currency: 'USD',
      stock: 10,
      category,
      status: ProductStatus.ACTIVE,
      tags: [],
    });

  const makePaginated = (products: Product[]): PaginatedProducts => ({
    data: products,
    total: products.length,
    page: 1,
    limit: 10,
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
    useCase = new SearchProductsUseCase(productRepository);
  });

  it('should return paginated products without filters', async () => {
    const products = [makeProduct('1', 100, 'Smartphones')];
    productRepository.findAll.mockResolvedValue(makePaginated(products));

    const result = await useCase.execute({});

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(productRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('should filter by category', async () => {
    const products = [makeProduct('1', 100, 'Laptops')];
    productRepository.findAll.mockResolvedValue(makePaginated(products));

    const result = await useCase.execute({ category: 'Laptops' });

    expect(result.data[0].category).toBe('Laptops');
    expect(productRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Laptops' }),
    );
  });

  it('should filter by status', async () => {
    const products = [makeProduct('1', 100, 'Smartphones')];
    productRepository.findAll.mockResolvedValue(makePaginated(products));

    await useCase.execute({ status: ProductStatus.ACTIVE });

    expect(productRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ status: ProductStatus.ACTIVE }),
    );
  });

  it('should filter by price range', async () => {
    const products = [makeProduct('1', 500, 'Laptops')];
    productRepository.findAll.mockResolvedValue(makePaginated(products));

    await useCase.execute({ minPrice: 100, maxPrice: 1000 });

    expect(productRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 100, maxPrice: 1000 }),
    );
  });

  it('should apply sorting', async () => {
    productRepository.findAll.mockResolvedValue(makePaginated([]));

    await useCase.execute({ sortBy: 'price', sortOrder: 'asc' });

    expect(productRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'price', sortOrder: 'asc' }),
    );
  });

  it('should use default pagination values', async () => {
    productRepository.findAll.mockResolvedValue(makePaginated([]));

    await useCase.execute({});

    expect(productRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('should use provided pagination values', async () => {
    productRepository.findAll.mockResolvedValue({
      data: [],
      total: 30,
      page: 2,
      limit: 5,
    });

    const result = await useCase.execute({ page: 2, limit: 5 });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
  });
});
