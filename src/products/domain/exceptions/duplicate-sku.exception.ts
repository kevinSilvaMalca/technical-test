export class DuplicateSkuException extends Error {
  constructor(sku: string) {
    super(`Product with SKU '${sku}' already exists`);
    this.name = 'DuplicateSkuException';
  }
}
