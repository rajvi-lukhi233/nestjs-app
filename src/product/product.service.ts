import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  private toResponse(product: ProductDocument) {
    const obj = product.toObject();

    obj.image = `${process.env.BASE_URL}/uploads/products/${obj.image}`;

    return obj;
  }

  private async removeImageFile(imagePath: string): Promise<void> {
    if (!imagePath?.startsWith('/uploads/products/')) {
      return;
    }
    const filename = imagePath.replace('/uploads/products/', '');
    const absolute = join(process.cwd(), 'uploads', 'products', filename);
    if (existsSync(absolute)) {
      await unlink(absolute);
    }
  }

  async create(dto: CreateProductDto, file: Express.Multer.File) {
    return this.productModel.create({ ...dto, image: file.filename });
  }

  async findAll() {
    return this.productModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toResponse(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    file: Express.Multer.File | undefined,
  ) {
    const existing = await this.productModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Product not found');
    }
    let image = existing.image;
    if (file) {
      await this.removeImageFile(existing.image);
      image = file.filename;
    }
    return await this.productModel
      .findByIdAndUpdate(
        id,
        { ...dto, image },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.removeImageFile(product.image);
  }
}
