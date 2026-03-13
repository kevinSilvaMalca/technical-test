import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IProductPort,
  ProductData,
} from '../../domain/ports/product-port.interface';
import {
  ProductSchemaClass,
  ProductDocument,
} from '../../../products/infrastructure/schemas/product.schema';

@Injectable()
export class ProductAdapter implements IProductPort {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getById(id: string): Promise<ProductData | null> {
    const doc = await this.productModel.findById(id);
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      sku: doc.sku,
      name: doc.name,
      picture: doc.picture,
      price: doc.price,
      stock: doc.stock,
    };
  }
}
