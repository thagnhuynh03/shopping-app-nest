import { Controller, Post, Get, Body, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest } from './dto/create-user.request';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { CreateAddressRequest } from './dto/create-address.request';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    createUser(@Body() request: CreateUserRequest) {
        return this.usersService.createUser(request);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@CurrentUser() user: TokenPayload) {
        return user;
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  getAddresses(@CurrentUser() user: TokenPayload) {
    return this.usersService.getAddresses(user.userId);
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  async addAddress(@CurrentUser() user: TokenPayload, @Body() request: CreateAddressRequest) {
    return this.usersService.createAddress(user.userId, request);
  }
}
