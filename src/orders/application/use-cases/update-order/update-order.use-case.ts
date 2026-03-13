import { IOrderRepository } from '../../../domain/ports/order-repository.interface';
import { IProductPort } from '../../../domain/ports/product-port.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderNotFoundException } from '../../../domain/exceptions/order-not-found.exception';
import { ProductNotFoundException } from '../../../../products/domain/exceptions/product-not-found.exception';

export interface UpdateOrderItemInput {
  productId: string;
  quantity: number;
  discount?: number;
}

export interface UpdateOrderInput {
  clientName?: string;
  clientEmail?: string;
  items?: UpdateOrderItemInput[];
  tax?: number;
  status?: OrderStatus;
}

export class UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productPort: IProductPort,
  ) {}

  async execute(id: string, input: UpdateOrderInput): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new OrderNotFoundException(id);
    }

    let resolvedItems: Parameters<Order['withUpdates']>[0]['items'];

    if (input.items) {
      resolvedItems = await Promise.all(
        input.items.map(async (item) => {
          const product = await this.productPort.getById(item.productId);
          if (!product) {
            throw new ProductNotFoundException(item.productId);
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
    }

    const updated = order.withUpdates({
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      items: resolvedItems,
      tax: input.tax,
      status: input.status,
    });

    return this.orderRepository.update(updated);
  }
}
