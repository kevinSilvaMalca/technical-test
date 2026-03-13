import { OrderItem, OrderItemProps } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { EmptyOrderException } from '../exceptions/empty-order.exception';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';

export interface OrderProps {
  id: string;
  identifier: string;
  clientName: string;
  clientEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export class Order {
  readonly id: string;
  readonly identifier: string;
  readonly clientName: string;
  readonly clientEmail: string;
  readonly items: OrderItem[];
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly status: OrderStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: OrderProps) {
    this.id = props.id;
    this.identifier = props.identifier;
    this.clientName = props.clientName;
    this.clientEmail = props.clientEmail;
    this.items = props.items;
    this.subtotal = props.subtotal;
    this.tax = props.tax;
    this.total = props.total;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    id: string;
    identifier: string;
    clientName: string;
    clientEmail: string;
    items: OrderItemProps[];
    tax: number;
  }): Order {
    if (!props.items || props.items.length === 0) {
      throw new EmptyOrderException();
    }

    const orderItems = props.items.map((i) => new OrderItem(i));
    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = subtotal + props.tax;
    const now = new Date();

    return new Order({
      id: props.id,
      identifier: props.identifier,
      clientName: props.clientName,
      clientEmail: props.clientEmail,
      items: orderItems,
      subtotal,
      tax: props.tax,
      total,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  validateStatusTransition(newStatus: OrderStatus): void {
    if (!VALID_TRANSITIONS[this.status].includes(newStatus)) {
      throw new InvalidStatusTransitionException(this.status, newStatus);
    }
  }

  withUpdates(updates: {
    clientName?: string;
    clientEmail?: string;
    items?: OrderItemProps[];
    tax?: number;
    status?: OrderStatus;
  }): Order {
    if (updates.status !== undefined) {
      this.validateStatusTransition(updates.status);
    }

    let items = this.items;
    let subtotal = this.subtotal;
    let tax = updates.tax ?? this.tax;

    if (updates.items) {
      if (updates.items.length === 0) {
        throw new EmptyOrderException();
      }
      items = updates.items.map((i) => new OrderItem(i));
      subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    }

    const total = subtotal + tax;

    return new Order({
      id: this.id,
      identifier: this.identifier,
      clientName: updates.clientName ?? this.clientName,
      clientEmail: updates.clientEmail ?? this.clientEmail,
      items,
      subtotal,
      tax,
      total,
      status: updates.status ?? this.status,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
