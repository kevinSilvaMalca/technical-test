import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { ProductSchemaClass, ProductDocument } from '../schemas/product.schema';
import {
  IProductRepository,
  FindAllOptions,
  PaginatedProducts,
} from '../../domain/ports/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductStatus } from '../../domain/enums/product-status.enum';

@Injectable()
export class MongoProductRepository implements IProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const doc = await this.productModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const doc = await this.productModel.findOne({ sku });
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(options: FindAllOptions): Promise<PaginatedProducts> {
    const filter: QueryFilter<ProductDocument> = {};

    if (options.category) filter.category = options.category;
    if (options.status) filter.status = options.status;
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      filter.price = {};
      if (options.minPrice !== undefined) filter.price.$gte = options.minPrice;
      if (options.maxPrice !== undefined) filter.price.$lte = options.maxPrice;
    }

    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const skip = (page - 1) * limit;

    const sortField = options.sortBy ?? 'createdAt';
    const sortDir = options.sortOrder === 'desc' ? -1 : 1;

    const [docs, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit),
      this.productModel.countDocuments(filter),
    ]);

    return {
      data: docs.map((d) => this.toDomain(d)),
      total,
      page,
      limit,
    };
  }

  async save(product: Product): Promise<Product> {
    const doc = new this.productModel({
      _id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      picture: product.picture,
      price: product.price,
      currency: product.currency,
      stock: product.stock,
      category: product.category,
      status: product.status,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(product: Product): Promise<Product> {
    const doc = await this.productModel.findByIdAndUpdate(
      product.id,
      {
        name: product.name,
        sku: product.sku,
        description: product.description,
        picture: product.picture,
        price: product.price,
        stock: product.stock,
        category: product.category,
        status: product.status,
        tags: product.tags,
        updatedAt: product.updatedAt,
      },
      { new: true },
    );
    return this.toDomain(doc!);
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id);
  }

  private toDomain(doc: ProductDocument): Product {
    return new Product({
      id: doc._id.toString(),
      name: doc.name,
      sku: doc.sku,
      description: doc.description,
      picture: doc.picture,
      price: doc.price,
      currency: 'USD',
      stock: doc.stock,
      category: doc.category,
      status: doc.status as ProductStatus,
      tags: doc.tags,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
