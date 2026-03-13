import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchemaClass, ProductSchema } from './infrastructure/schemas/product.schema';
import { MongoProductRepository } from './infrastructure/repositories/mongo-product.repository';
import { PRODUCT_REPOSITORY } from './domain/ports/product-repository.interface';
import { CreateProductUseCase } from './application/use-cases/create-product/create-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product/get-product.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-products/search-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product/delete-product.use-case';
import { ProductsController } from './infrastructure/http/products.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: MongoProductRepository },
    {
      provide: CreateProductUseCase,
      useFactory: (repo: MongoProductRepository) => new CreateProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductUseCase,
      useFactory: (repo: MongoProductRepository) => new GetProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: SearchProductsUseCase,
      useFactory: (repo: MongoProductRepository) => new SearchProductsUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (repo: MongoProductRepository) => new UpdateProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: DeleteProductUseCase,
      useFactory: (repo: MongoProductRepository) => new DeleteProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY],
    },
  ],
  exports: [
    CreateProductUseCase,
    GetProductUseCase,
    SearchProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    PRODUCT_REPOSITORY,
  ],
})
export class ProductsModule {}
