export class InsufficientStockException extends Error {
  constructor(sku: string, requested: number, available: number) {
    super(
      `Insufficient stock for product '${sku}': requested ${requested}, available ${available}`,
    );
    this.name = 'InsufficientStockException';
  }
}
