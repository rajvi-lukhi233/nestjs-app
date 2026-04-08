import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Role } from 'src/user/user.type';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';
import { ProductService } from 'src/product/product.service';

export type RequestUser = {
  userId: string;
  role: Role;
};

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly productservice: ProductService,
  ) {}
  private normalizeProducts(
    products: { productId: string; quantity: number }[],
  ) {
    return products.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      quantity: item.quantity,
    }));
  }
  async create(
    userId: string,
    dto: CreateOrderDto,
    totalAmount,
  ): Promise<OrderDocument> {
    return this.orderModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      products: this.normalizeProducts(dto.products),
      totalAmount,
    });
  }

  async getAllUserWise(user: RequestUser): Promise<OrderDocument[]> {
    if (user.role === Role.Admin) {
      return this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .populate('userId', 'name email role')
        .populate('products.productId', 'name price')
        .exec();
    }
    return this.orderModel
      .find({ userId: new Types.ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role')
      .populate('products.productId', 'name price')
      .exec();
  }
  async findOrderById(id: string) {
    return await this.orderModel.findById(id).exec();
  }
  async getOrderById(id: string) {
    return await this.orderModel.findById(id).populate([
      { path: 'userId', select: 'name email role' },
      { path: 'products.productId', select: 'name price' },
    ]);
  }

  async update(id: string, dto: UpdateOrderDto) {
    const updatePayload: UpdateQuery<Order> = { ...dto };

    if (dto.products) {
      updatePayload.products = this.normalizeProducts(dto.products);
    }
    return await this.orderModel
      .findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
      .populate('userId', 'name email role')
      .populate('products.productId', 'name price')
      .exec();
  }

  async remove(id: string) {
    return await this.orderModel.findByIdAndDelete(id).exec();
  }
}
