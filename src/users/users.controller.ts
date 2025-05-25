import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest } from './dto/create-user-request';
import { AnyFilesInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    createUser(@Body() request: CreateUserRequest) {
        return this.usersService.createUser(request);
    }
}
