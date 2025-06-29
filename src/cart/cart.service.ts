import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCartItems(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { size: true, color: { include: { color: true, product: { include: { images: true }} }} } } },
    });
  }

  async addToCart(userId: number, productSizeId: number, quantity: number, price: number) {
    // Check if item exists
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productSizeId },
    });
    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      return this.prisma.cartItem.create({
        data: {
          userId,
          productSizeId,
          quantity,
          price,
        },
      });
    }
  }

  async removeFromCart(cartItemId: number, userId: number) {
    // First verify the cart item belongs to the user
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async updateCartQuantity(cartItemId: number, quantity: number, userId: number) {
    // First verify the cart item belongs to the user
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      return this.prisma.cartItem.delete({
        where: { id: cartItemId },
      });
    }
    
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  async removeAllCartItems(userId: number) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
