import { Controller, Post, Get, Body, UseGuards, BadRequestException, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';
import { CreateOrderDto } from './dto/create-order.request';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(@CurrentUser() user: TokenPayload, @Body() reqest: CreateOrderDto) {
    if (typeof reqest.cart === "string") {
      try {
        reqest.cart = JSON.parse(reqest.cart);
      } catch (e) {
        throw new BadRequestException("Invalid cart format");
      }
    }
    return this.orderService.createOrder(user.userId, reqest);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrders(@CurrentUser() user: TokenPayload) {
    return this.orderService.getOrders(user.userId);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.orderService.cancelOrder(user.userId, id);
  }
}
