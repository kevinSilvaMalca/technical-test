import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProductStatus } from '../../domain/enums/product-status.enum';

export type ProductDocument = HydratedDocument<ProductSchemaClass>;

@Schema({ collection: 'products', timestamps: false })
export class ProductSchemaClass {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  sku!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ default: '' })
  picture!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ type: String, default: 'USD' })
  currency!: string;

  @Prop({ required: true, default: 0 })
  stock!: number;

  @Prop({ required: true, index: true })
  category!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ProductStatus),
    default: ProductStatus.ACTIVE,
    index: true,
  })
  status!: ProductStatus;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const ProductSchema = SchemaFactory.createForClass(ProductSchemaClass);
ProductSchema.index({ price: 1 });
