import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CartService } from 'src/cart/cart.service';
import { CreateOrderDto } from './dto/create-session.request';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly stripe: Stripe,
    private readonly cartService: CartService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService
  ) {}

  async createCartSession(userId: number, data: CreateOrderDto) {
    const cartItems = await this.cartService.getCartItems(userId);
    return this.stripe.checkout.sessions.create({
      metadata: {
        userId,
        cart: JSON.stringify(data.cart), // Only if small!
        addressId: data.addressId,
        status: 'waiting_for_delivery',
      },
      line_items: cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          unit_amount: item.price * 100,
          product_data: {
            name: item.product.size.name + ' ' + item.product.color.color.name + ' ' + item.product.color.product.name,
            description: item.product.color.product.description,
          },
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),
    });
  }

  async handleCheckoutWebhook(body: any, signature: string) {
    const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type !== 'checkout.session.completed') {
      return;
    }

    const session = await this.stripe.checkout.sessions.retrieve(
      event.data.object.id,
    );
    const metadata = session.metadata;
    if (!metadata || !metadata.cart || !metadata.addressId || !metadata.userId) {
      throw new Error('Missing metadata in session');
    }

    // Parse dữ liệu từ metadata
    const userId = Number(metadata.userId);
    const addressId = Number(metadata.addressId);
    const status = metadata.status || 'pending';
    const paymentMethodId = 1;
    let cart;

    try {
      cart = JSON.parse(metadata.cart);
    } catch (err) {
      throw new Error('Invalid cart data in metadata');
    }

    // Tạo đơn hàng
    const orderData = {
      addressId,
      paymentMethodId,
      cart,
      status,
    };

    await this.orderService.createOrder(userId, orderData);
  }
}