export class InvalidStatusTransitionException extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition order status from '${from}' to '${to}'`);
    this.name = 'InvalidStatusTransitionException';
  }
}
