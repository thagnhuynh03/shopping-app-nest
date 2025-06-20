import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class CreateUserRequest {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsStrongPassword({}, {
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      })
    password: string;
}