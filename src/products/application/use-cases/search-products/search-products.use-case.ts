import {
  IProductRepository,
  FindAllOptions,
  PaginatedProducts,
} from '../../../domain/ports/product-repository.interface';
import { ProductStatus } from '../../../domain/enums/product-status.enum';

export interface SearchProductsInput {
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class SearchProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: SearchProductsInput): Promise<PaginatedProducts> {
    const options: FindAllOptions = {
      category: input.category,
      status: input.status,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      page: input.page ?? 1,
      limit: input.limit ?? 10,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    return this.productRepository.findAll(options);
  }
}
