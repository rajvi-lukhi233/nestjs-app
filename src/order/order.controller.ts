import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RequestUser } from './order.service';
import { ProductService } from 'src/product/product.service';
import { Role } from 'src/user/user.type';
import { Types } from 'mongoose';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}
  private canAccess(userId: string, user: RequestUser) {
    return user.role === Role.Admin || userId == user.userId;
  }

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @Req() req: Request & { user: RequestUser },
  ) {
    let totalAmount = 0;
    for (let item of dto.products) {
      const product = await this.productService.findOne(item.productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      totalAmount += product?.price * (item.quantity || 1);
    }
    const createOrder = await this.orderService.create(
      req.user.userId,
      dto,
      totalAmount,
    );
    return { message: 'Order created successfully', data: createOrder };
  }

  @Get()
  async getAllUserWise(@Req() req: Request & { user: RequestUser }) {
    const orders = await this.orderService.getAllUserWise(req.user);
    return { message: 'Orders retrive successfully', data: orders };
  }

  @Get(':id')
  async getOrderById(
    @Param('id') id: string,
    @Req() req: Request & { user: RequestUser },
  ) {
    const order = await this.orderService.getOrderById(id);
    if (!order) {
      throw new NotFoundException('This order not found');
    }

    if (!this.canAccess(order.userId._id.toString(), req.user)) {
      throw new ForbiddenException('You are not allowed to access this order');
    }

    return { message: 'Order retrive successfully', data: order };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: Request & { user: RequestUser },
  ) {
    const order = await this.orderService.findOrderById(id);
    if (!order) {
      throw new NotFoundException('This order is not found');
    }
    if (!this.canAccess(order.userId.toString(), req.user)) {
      throw new ForbiddenException('You are not allowed to update this order');
    }
    const updatedOrder = await this.orderService.update(id, dto);
    return { message: 'Order updated successfully', data: updatedOrder };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request & { user: RequestUser },
  ) {
    const order = await this.orderService.findOrderById(id);
    if (!order) {
      throw new NotFoundException('This order is not found');
    }
    if (!this.canAccess(order.userId.toString(), req.user)) {
      throw new ForbiddenException('You are not allowed to delete this order');
    }
    this.orderService.remove(id);
    return { message: 'Order deleted successfully' };
  }
}
