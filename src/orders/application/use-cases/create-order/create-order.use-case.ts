import * as crypto from 'crypto';
import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { IProductPort } from '../../../domain/ports/product-port.interface';
import { Order } from '../../../domain/entities/order.entity';
import { EmptyOrderException } from '../../../domain/exceptions/empty-order.exception';
import { InsufficientStockException } from '../../../domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from '../../../../products/domain/exceptions/product-not-found.exception';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  discount?: number;
}

export interface CreateOrderInput {
  clientName: string;
  clientEmail: string;
  items: CreateOrderItemInput[];
  tax: number;
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productPort: IProductPort,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    if (!input.items || input.items.length === 0) {
      throw new EmptyOrderException();
    }

    const orderItemProps = await Promise.all(
      input.items.map(async (item) => {
        const product = await this.productPort.getById(item.productId);
        if (!product) {
          throw new ProductNotFoundException(item.productId);
        }
        if (product.stock < item.quantity) {
          throw new InsufficientStockException(
            product.sku,
            item.quantity,
            product.stock,
          );
        }
        return {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          picture: product.picture,
          unitPrice: product.price,
          quantity: item.quantity,
          discount: item.discount ?? 0,
        };
      }),
    );

    const order = Order.create({
      id: crypto.randomUUID(),
      identifier: crypto.randomUUID(),
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      items: orderItemProps,
      tax: input.tax,
    });

    return this.orderRepository.save(order);
  }
}
