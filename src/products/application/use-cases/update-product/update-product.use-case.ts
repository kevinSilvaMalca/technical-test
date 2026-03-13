import { IProductRepository } from '../../../domain/ports/product-repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';
import { DuplicateSkuException } from '../../../domain/exceptions/duplicate-sku.exception';

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  description?: string;
  picture?: string;
  price?: number;
  stock?: number;
  category?: string;
  status?: ProductStatus;
  tags?: string[];
}

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }

    if (input.sku) {
      const existing = await this.productRepository.findBySku(input.sku);
      if (existing && existing.id !== id) {
        throw new DuplicateSkuException(input.sku);
      }
    }

    const updated = product.withUpdates(input);
    return this.productRepository.update(updated);
  }
}
