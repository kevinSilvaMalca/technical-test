import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderSchemaClass, OrderDocument } from '../schemas/order.schema';
import { IOrderRepository } from '../../domain/ports/order-repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';

@Injectable()
export class MongoOrderRepository implements IOrderRepository {
  constructor(
    @InjectModel(OrderSchemaClass.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const doc = await this.orderModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(): Promise<Order[]> {
    const docs = await this.orderModel.find();
    return docs.map((d) => this.toDomain(d));
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const docs = await this.orderModel.find({ status });
    return docs.map((d) => this.toDomain(d));
  }

  async save(order: Order): Promise<Order> {
    const doc = new this.orderModel({
      _id: order.id,
      identifier: order.identifier,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      items: order.items.map((item) => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        picture: item.picture,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount,
        lineTotal: item.lineTotal,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(order: Order): Promise<Order> {
    const doc = await this.orderModel.findByIdAndUpdate(
      order.id,
      {
        clientName: order.clientName,
        clientEmail: order.clientEmail,
        items: order.items.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          picture: item.picture,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          discount: item.discount,
          lineTotal: item.lineTotal,
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        updatedAt: order.updatedAt,
      },
      { new: true },
    );
    return this.toDomain(doc!);
  }

  private toDomain(doc: OrderDocument): Order {
    const items = (doc.items ?? []).map(
      (item) =>
        new OrderItem({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          picture: item.picture,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          discount: item.discount,
        }),
    );

    return new Order({
      id: doc._id.toString(),
      identifier: doc.identifier,
      clientName: doc.clientName,
      clientEmail: doc.clientEmail,
      items,
      subtotal: doc.subtotal,
      tax: doc.tax,
      total: doc.total,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
