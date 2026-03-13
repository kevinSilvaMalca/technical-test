import { IProductRepository } from '../../../domain/ports/product-repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    return product;
  }
}
