import { Controller, Post, UseGuards, Body, Get, ParseFilePipe, MaxFileSizeValidator, UseInterceptors, UploadedFile, FileTypeValidator, Param, Query } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateProductRequest } from './dto/create-product.request';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() body: CreateProductRequest,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.productsService.createProduct(body, user.userId);
  }

  @Post(':productId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/images/products',
        filename: (req, file, callback) => {
          callback(
            null,
            `${req.params.productId}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    _file: Express.Multer.File,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProducts(
    @Query('query') query?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '8',
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 8;
    const minPriceNum = minPrice !== undefined ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice !== undefined ? parseFloat(maxPrice) : undefined;
    return await this.productsService.getProducts(query, pageNum, pageSizeNum, minPriceNum, maxPriceNum);
  }

  @Get(':productId')
  @UseGuards(JwtAuthGuard)
  async getProduct(@Param('productId') productId: string) {
    return this.productsService.getProduct(+productId);
  }
}
