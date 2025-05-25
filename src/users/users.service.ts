import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user-request';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}
    async createUser(data: CreateUserRequest) {
        try {
            return this.prisma.user.create({
                data: {
                    ...data,
		                password: await bcrypt.hash(data.password, 10),
            },
            select: {
                id: true,
                email: true,
            },
        });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new UnauthorizedException('User with this email already exists');
            }
            throw error;
        }
    }
}