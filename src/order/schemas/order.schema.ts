import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from 'src/product/schemas/product.schema';
import { User } from 'src/user/schemas/user.schema';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

@Schema({ _id: false, versionKey: false })
export class OrderProductItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

const OrderProductItemSchema = SchemaFactory.createForClass(OrderProductItem);

@Schema({ _id: false, versionKey: false })
export class ShippingAddress {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  zipcode: string;

  @Prop({ required: true })
  address: string;
}

const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderProductItemSchema], required: true })
  products: OrderProductItem[];

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ enum: OrderStatus, default: OrderStatus.Pending })
  orderStatus: OrderStatus;

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
