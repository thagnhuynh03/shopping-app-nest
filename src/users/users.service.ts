import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserRequest } from './dto/create-user.request';
import { Prisma } from '@prisma/client';
import { CreateAddressRequest } from './dto/create-address.request';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserRequest) {
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        },
        select: {
          email: true,
          id: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw err;
    }
  }

  async getUser(filter: Prisma.UserWhereUniqueInput) {
    return this.prismaService.user.findUniqueOrThrow({
      where: filter,
    });
  }

  async getAddresses(userId: number) {
    return this.prismaService.address.findMany({
      where: { userId },
    });
  }

  async createAddress(userId: number, data: CreateAddressRequest) {
    return this.prismaService.address.create({
      data: { ...data, userId }
    });
  }
}