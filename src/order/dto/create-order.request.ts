import { IsInt, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @IsInt()
  @Type(() => Number)
  productSizeId: number;

  @IsInt()
  @Type(() => Number)
  quantity: number;

  @IsInt()
  @Type(() => Number)
  price: number;
}

export class CreateOrderDto {
  @IsInt()
  @Type(() => Number)
  addressId: number;

  @IsInt()
  @Type(() => Number)
  paymentMethodId: number;

  @IsString()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cart: CartItemDto[];
} 