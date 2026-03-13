import { ProductStatus } from '../enums/product-status.enum';
import { InvalidPriceException } from '../exceptions/invalid-price.exception';
import { InvalidStockException } from '../exceptions/invalid-stock.exception';

export interface ProductProps {
  id: string;
  name: string;
  sku: string;
  description: string;
  picture: string;
  price: number;
  currency: 'USD';
  stock: number;
  category: string;
  status: ProductStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly sku: string;
  readonly description: string;
  readonly picture: string;
  readonly price: number;
  readonly currency: 'USD';
  readonly stock: number;
  readonly category: string;
  readonly status: ProductStatus;
  readonly tags: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    if (props.price <= 0) {
      throw new InvalidPriceException(props.price);
    }
    if (props.stock < 0) {
      throw new InvalidStockException(props.stock);
    }

    this.id = props.id;
    this.name = props.name;
    this.sku = props.sku;
    this.description = props.description;
    this.picture = props.picture;
    this.price = props.price;
    this.currency = 'USD';
    this.stock = props.stock;
    this.category = props.category;
    this.status = props.status;
    this.tags = props.tags;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ProductProps, 'createdAt' | 'updatedAt'>,
  ): Product {
    const now = new Date();
    return new Product({ ...props, createdAt: now, updatedAt: now });
  }

  withUpdates(
    updates: Partial<Omit<ProductProps, 'id' | 'createdAt' | 'currency'>>,
  ): Product {
    return new Product({
      id: this.id,
      name: updates.name ?? this.name,
      sku: updates.sku ?? this.sku,
      description: updates.description ?? this.description,
      picture: updates.picture ?? this.picture,
      price: updates.price ?? this.price,
      currency: 'USD',
      stock: updates.stock ?? this.stock,
      category: updates.category ?? this.category,
      status: updates.status ?? this.status,
      tags: updates.tags ?? this.tags,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
