import * as crypto from 'crypto';
import { IProductRepository } from '../../../domain/ports/product-repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { ProductStatus } from '../../../domain/enums/product-status.enum';
import { DuplicateSkuException } from '../../../domain/exceptions/duplicate-sku.exception';

export interface CreateProductInput {
  name: string;
  sku: string;
  description: string;
  picture: string;
  price: number;
  stock: number;
  category: string;
  status?: ProductStatus;
  tags?: string[];
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const existing = await this.productRepository.findBySku(input.sku);
    if (existing) {
      throw new DuplicateSkuException(input.sku);
    }

    const product = Product.create({
      id: crypto.randomUUID(),
      name: input.name,
      sku: input.sku,
      description: input.description,
      picture: input.picture,
      price: input.price,
      currency: 'USD',
      stock: input.stock,
      category: input.category,
      status: input.status ?? ProductStatus.ACTIVE,
      tags: input.tags ?? [],
    });

    return this.productRepository.save(product);
  }
}
