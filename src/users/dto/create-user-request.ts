import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class CreateUserRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsStrongPassword()
    password: string;
}