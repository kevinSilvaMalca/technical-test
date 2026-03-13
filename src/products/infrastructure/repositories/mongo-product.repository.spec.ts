import { MongoProductRepository } from './mongo-product.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductStatus } from '../../domain/enums/product-status.enum';

describe('MongoProductRepository', () => {
  let repository: MongoProductRepository;
  let productModel: any;

  const mockDoc = {
    _id: 'product-1',
    name: 'iPhone 15',
    sku: 'IPHONE-15',
    description: 'Apple iPhone 15',
    picture: 'pic.jpg',
    price: 999.99,
    currency: 'USD',
    stock: 50,
    category: 'Smartphones',
    status: ProductStatus.ACTIVE,
    tags: ['apple'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    const saveMock = jest.fn().mockResolvedValue(mockDoc);
    const ModelMock = jest.fn().mockImplementation(() => ({ save: saveMock }));

    productModel = Object.assign(ModelMock, {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    });

    repository = new MongoProductRepository(productModel as any);
  });

  describe('findById', () => {
    it('should return a Product when document is found', async () => {
      productModel.findById.mockResolvedValue(mockDoc);

      const result = await repository.findById('product-1');

      expect(result).toBeInstanceOf(Product);
      expect(result?.sku).toBe('IPHONE-15');
    });

    it('should return null when document is not found', async () => {
      productModel.findById.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findBySku', () => {
    it('should return a Product when SKU is found', async () => {
      productModel.findOne.mockResolvedValue(mockDoc);

      const result = await repository.findBySku('IPHONE-15');

      expect(result).toBeInstanceOf(Product);
    });

    it('should return null when SKU is not found', async () => {
      productModel.findOne.mockResolvedValue(null);

      const result = await repository.findBySku('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const queryChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockDoc]),
      };
      productModel.find.mockReturnValue(queryChain);
      productModel.countDocuments.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply filters correctly', async () => {
      const queryChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockDoc]),
      };
      productModel.find.mockReturnValue(queryChain);
      productModel.countDocuments.mockResolvedValue(1);

      await repository.findAll({
        category: 'Smartphones',
        status: ProductStatus.ACTIVE,
        minPrice: 100,
        maxPrice: 2000,
      });

      expect(productModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Smartphones',
          status: ProductStatus.ACTIVE,
          price: { $gte: 100, $lte: 2000 },
        }),
      );
    });
  });

  describe('save', () => {
    it('should save product and return domain entity', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockDoc);
      productModel.mockImplementation(() => ({ save: saveMock }));

      const product = Product.create({
        id: 'product-1',
        name: 'iPhone 15',
        sku: 'IPHONE-15',
        description: 'desc',
        picture: 'pic.jpg',
        price: 999.99,
        currency: 'USD',
        stock: 50,
        category: 'Smartphones',
        status: ProductStatus.ACTIVE,
        tags: [],
      });

      const result = await repository.save(product);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Product);
    });
  });

  describe('update', () => {
    it('should update product and return domain entity', async () => {
      productModel.findByIdAndUpdate.mockResolvedValue(mockDoc);

      const product = Product.create({
        id: 'product-1',
        name: 'Updated iPhone',
        sku: 'IPHONE-15',
        description: 'desc',
        picture: 'pic.jpg',
        price: 1099.99,
        currency: 'USD',
        stock: 40,
        category: 'Smartphones',
        status: ProductStatus.ACTIVE,
        tags: [],
      });

      const result = await repository.update(product);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'product-1',
        expect.any(Object),
        { new: true },
      );
      expect(result).toBeInstanceOf(Product);
    });
  });

  describe('delete', () => {
    it('should delete product by id', async () => {
      productModel.findByIdAndDelete.mockResolvedValue(mockDoc);

      await repository.delete('product-1');

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('product-1');
    });
  });
});
