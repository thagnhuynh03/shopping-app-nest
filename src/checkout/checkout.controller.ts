import { Body, Controller, Post, Req, Res, UseGuards, Headers, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { CreateOrderDto } from './dto/create-session.request';
import { Request, Response } from 'express';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  async createSession(@CurrentUser() user: TokenPayload, @Body() request: CreateOrderDto) {
    return this.checkoutService.createCartSession(user.userId, request);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleCheckoutWebhooks(
    @Req() req: Request, 
    @Res() res: Response,
    @Headers('stripe-signature') signature: string
  ) {
    try {
      await this.checkoutService.handleCheckoutWebhook(req.body, signature);
      res.send({ received: true });
    } catch (err) {
      console.error('Webhook Error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}