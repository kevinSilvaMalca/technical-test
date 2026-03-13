export class InvalidPriceException extends Error {
  constructor(price: number) {
    super(`Price '${price}' is invalid. Price must be greater than 0`);
    this.name = 'InvalidPriceException';
  }
}
