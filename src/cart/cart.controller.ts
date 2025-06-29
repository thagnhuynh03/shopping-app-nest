import { Controller, Get, Post, Delete, Body, Param, UseGuards, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCartItems(@CurrentUser() user: TokenPayload) {
    return this.cartService.getCartItems(user.userId);
  }

  @Post()
  async addToCart(
    @CurrentUser() user: TokenPayload,
    @Body() body: { productSizeId: number; quantity: number; price: number }
  ) {
    return this.cartService.addToCart(user.userId, body.productSizeId, body.quantity, body.price);
  }

  @Post(':cartItemId')
  async removeFromCart(
    @CurrentUser() user: TokenPayload,
    @Param('cartItemId') cartItemId: string
  ) {
    return this.cartService.removeFromCart(+cartItemId, user.userId);
  }

  @Put()
  async updateCartQuantity(
    @CurrentUser() user: TokenPayload,
    @Body() body: { cartItemId: number, quantity: number }
  ) {
    return this.cartService.updateCartQuantity(body.cartItemId, body.quantity, user.userId);
  }

  @Delete()
  async removeAllCartItems(@CurrentUser() user: TokenPayload) {
    return this.cartService.removeAllCartItems(user.userId);
  }
}
