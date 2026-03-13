import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus } from '../../domain/enums/order-status.enum';

export type OrderDocument = HydratedDocument<OrderSchemaClass>;

@Schema({ _id: false })
export class OrderItemSchemaClass {
  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  sku!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  picture!: string;

  @Prop({ required: true })
  unitPrice!: number;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ default: 0 })
  discount!: number;

  @Prop({ required: true })
  lineTotal!: number;
}

@Schema({ collection: 'orders', timestamps: false })
export class OrderSchemaClass {
  @Prop({ required: true, unique: true })
  identifier!: string;

  @Prop({ required: true })
  clientName!: string;

  @Prop({ required: true })
  clientEmail!: string;

  @Prop({ type: [OrderItemSchemaClass], default: [] })
  items!: OrderItemSchemaClass[];

  @Prop({ required: true })
  subtotal!: number;

  @Prop({ required: true })
  tax!: number;

  @Prop({ required: true })
  total!: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItemSchemaClass);
export const OrderSchema = SchemaFactory.createForClass(OrderSchemaClass);
