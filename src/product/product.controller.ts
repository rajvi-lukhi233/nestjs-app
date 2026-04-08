import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/user.type';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { productImageMulterOptions } from './multer.config';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('image', productImageMulterOptions))
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const addProduct = await this.productService.create(dto, file);
    return { message: 'Product created successfully', data: addProduct };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    const products = await this.productService.findAll();
    return { message: 'Products reteive successfully', data: products };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return { message: 'Product reteive successfully', data: product };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('image', productImageMulterOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile()
    file: Express.Multer.File | undefined,
  ) {
    const updatedProduct = await this.productService.update(id, dto, file);
    return { message: 'Product updated successfully', data: updatedProduct };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return { message: 'Product deleted successfully' };
  }
}
