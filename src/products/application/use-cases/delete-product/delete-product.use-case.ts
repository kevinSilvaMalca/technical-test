import { IProductRepository } from '../../../domain/ports/product-repository.interface';
import { ProductNotFoundException } from '../../../domain/exceptions/product-not-found.exception';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundException(id);
    }
    await this.productRepository.delete(id);
  }
}
