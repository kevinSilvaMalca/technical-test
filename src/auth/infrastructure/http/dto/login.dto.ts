import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@technical-test.com', description: 'Registered email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin123!', description: 'Account password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}
