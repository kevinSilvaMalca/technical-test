export class OrderNotFoundException extends Error {
  constructor(id: string) {
    super(`Order with id '${id}' not found`);
    this.name = 'OrderNotFoundException';
  }
}
