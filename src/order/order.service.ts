import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.request';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: number, orderData: CreateOrderDto) {
    // orderData: { addressId, paymentMethodId, cart, status }
    const { addressId, paymentMethodId, cart, status } = orderData;
    // Calculate total
    const total = cart.reduce((sum: number, item) => sum + item.price * item.quantity, 0);
    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        addressId,
        paymentMethodId,
        total,
        status,
        orderItems: {
          create: cart.map(item => ({
            productSizeId: item.productSizeId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { orderItems: true },
    });
    return order;
  }

  async getOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            productSize: {
              include: {
                size: true,
                color: {
                  include: {
                    color: true,
                    product: true,
                  },
                },
              },
            },
          },
        },
        address: true,
        paymentMethod: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async cancelOrder(userId: number, orderId: number) {
    // Only allow cancelling if the order belongs to the user and is pending
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId, status: "pending" },
    });
    if (!order) {
      throw new Error("Order not found or cannot be cancelled");
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });
  }
}
