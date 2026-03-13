export class InvalidStockException extends Error {
  constructor(stock: number) {
    super(`Stock '${stock}' is invalid. Stock must be zero or greater`);
    this.name = 'InvalidStockException';
  }
}
