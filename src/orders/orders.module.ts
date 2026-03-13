import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OrderSchemaClass,
  OrderSchema,
} from './infrastructure/schemas/order.schema';
import { MongoOrderRepository } from './infrastructure/repositories/mongo-order.repository';
import { ORDER_REPOSITORY } from './domain/ports/order-repository.interface';
import { PRODUCT_PORT } from './domain/ports/product-port.interface';
import { ProductAdapter } from './infrastructure/adapters/product.adapter';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../products/infrastructure/schemas/product.schema';
import { CreateOrderUseCase } from './application/use-cases/create-order/create-order.use-case';
import { UpdateOrderUseCase } from './application/use-cases/update-order/update-order.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order/get-order.use-case';
import { ListOrdersUseCase } from './application/use-cases/list-orders/list-orders.use-case';
import { GetMonthTotalUseCase } from './application/use-cases/get-month-total/get-month-total.use-case';
import { GetHighestTotalUseCase } from './application/use-cases/get-highest-total/get-highest-total.use-case';
import { OrdersController } from './infrastructure/http/orders.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderSchemaClass.name, schema: OrderSchema },
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    { provide: ORDER_REPOSITORY, useClass: MongoOrderRepository },
    { provide: PRODUCT_PORT, useClass: ProductAdapter },
    {
      provide: CreateOrderUseCase,
      useFactory: (repo: MongoOrderRepository, port: ProductAdapter) =>
        new CreateOrderUseCase(repo, port),
      inject: [ORDER_REPOSITORY, PRODUCT_PORT],
    },
    {
      provide: UpdateOrderUseCase,
      useFactory: (repo: MongoOrderRepository, port: ProductAdapter) =>
        new UpdateOrderUseCase(repo, port),
      inject: [ORDER_REPOSITORY, PRODUCT_PORT],
    },
    {
      provide: GetOrderUseCase,
      useFactory: (repo: MongoOrderRepository) => new GetOrderUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: ListOrdersUseCase,
      useFactory: (repo: MongoOrderRepository) => new ListOrdersUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: GetMonthTotalUseCase,
      useFactory: (repo: MongoOrderRepository) =>
        new GetMonthTotalUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: GetHighestTotalUseCase,
      useFactory: (repo: MongoOrderRepository) =>
        new GetHighestTotalUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
  ],
  exports: [
    CreateOrderUseCase,
    UpdateOrderUseCase,
    GetOrderUseCase,
    ListOrdersUseCase,
    GetMonthTotalUseCase,
    GetHighestTotalUseCase,
  ],
})
export class OrdersModule {}
