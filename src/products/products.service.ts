import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductRequest } from './dto/create-product.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { ProductsGateway } from './products.gateway';

@Injectable()
export class ProductsService {
    constructor(
      private readonly prismaService: PrismaService,
      private readonly productsGateway: ProductsGateway,
    ) {}

    async createProduct(data: CreateProductRequest, userId: number) {
      const product = await this.prismaService.product.create({
        data: {
          ...data,
          userId,
        },
      });
      this.productsGateway.handleProductUpdated();
      return product;
    }

    async getProducts(query?: string, page = 1, pageSize = 8, minPrice?: number, maxPrice?: number) {
      const args: Prisma.ProductFindManyArgs = { where: {} };

      // Search by name/description
      if (query) {
        args.where = {
          ...args.where,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        };
      }

      // Filter by price range
      let price: any = (args.where!).price || {};
      if (minPrice !== undefined) price.gte = minPrice;
      if (maxPrice !== undefined) price.lte = maxPrice;
      if (minPrice !== undefined || maxPrice !== undefined) {
        (args.where!).price = price;
      }

      // Get total count for pagination
      const total = await this.prismaService.product.count({ where: args.where });

      // Pagination
      args.skip = (page - 1) * pageSize;
      args.take = pageSize;

      const products = await this.prismaService.product.findMany(args);

      const productsWithImage = await Promise.all(
        products.map(async (product) => ({
          ...product,
          imageExists: await this.imageExists(product.id),
        })),
      );

      return { products: productsWithImage, total };
    }

    async getProduct(productId: number) {
      try {
        const product = await this.prismaService.product.findUniqueOrThrow({
          where: { id: productId },
          include: {
            colors: {
              include: {
                color: true,
                size: {
                  include: {
                    size: true,
                  },
                },
              },
            },
          },
        });
        return {
          ...product,
          colors: product.colors.map((pc) => ({
            id: pc.id,
            colorId: pc.color.id,
            name: pc.color.name,
            sizes: pc.size.map((ps) => ({
              id: ps.id,
              sizeId: ps.size.id,
              name: ps.size.name,
              stock: ps.stock,
              price: ps.price,
            })),
          })),
          imageExists: await this.imageExists(productId),
        };
      } catch (err) {
        throw new NotFoundException(`Product not found with ID ${productId}`);
      }
    }

    async update(productId: number, data: Prisma.ProductUpdateInput) {
      await this.prismaService.product.update({
        where: { id: productId },
        data,
      });
    }
  
    private async imageExists(productId: number) {
      try {
        await fs.access(
          join(__dirname, '../../', `public/images/products/${productId}.jpg`),
          fs.constants.F_OK,
        );
        return true;
      } catch (err) {
        return false;
      }
    }
}
