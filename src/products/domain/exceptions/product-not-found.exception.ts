export class ProductNotFoundException extends Error {
  constructor(id: string) {
    super(`Product with id '${id}' not found`);
    this.name = 'ProductNotFoundException';
  }
}
