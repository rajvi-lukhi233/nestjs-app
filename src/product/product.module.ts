import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    AuthModule,
    UserModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, RolesGuard],
})
export class ProductModule {}
