export const PRODUCT_PORT = 'IProductPort';

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  picture: string;
  price: number;
  stock: number;
}

export interface IProductPort {
  getById(id: string): Promise<ProductData | null>;
}
