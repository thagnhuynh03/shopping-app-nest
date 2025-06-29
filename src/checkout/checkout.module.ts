import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { ProductsModule } from 'src/products/products.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CartModule } from 'src/cart/cart.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ConfigModule, ProductsModule, CartModule, OrderModule],
  controllers: [CheckoutController],
  providers: [CheckoutService,
    {
      provide: Stripe,
      useFactory: (configService: ConfigService) =>
        new Stripe(configService.getOrThrow('STRIPE_SECRET_KEY')),
      inject: [ConfigService],
    },
  ]
})
export class CheckoutModule {}
