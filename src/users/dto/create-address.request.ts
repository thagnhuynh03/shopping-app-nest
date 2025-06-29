import { IsNotEmpty } from "class-validator";

export class CreateAddressRequest {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    address: string;
    @IsNotEmpty()
    phoneNumber: string;
    @IsNotEmpty()
    city: number;
    @IsNotEmpty()
    district: number;
    @IsNotEmpty()
    ward: number;
}