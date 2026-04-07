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
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
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

const imageFileValidators = [
  new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
  new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|gif|webp)$/ }),
];

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
    return this.productService.create(dto, file);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('image', productImageMulterOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: imageFileValidators,
      }),
    )
    file: Express.Multer.File | undefined,
  ) {
    return this.productService.update(id, dto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
