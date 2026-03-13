export interface OrderItemProps {
  productId: string;
  sku: string;
  name: string;
  picture: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

export class OrderItem {
  readonly productId: string;
  readonly sku: string;
  readonly name: string;
  readonly picture: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly discount: number;
  readonly lineTotal: number;

  constructor(props: OrderItemProps) {
    this.productId = props.productId;
    this.sku = props.sku;
    this.name = props.name;
    this.picture = props.picture;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.discount = props.discount;
    this.lineTotal = props.unitPrice * props.quantity - props.discount;
  }
}
