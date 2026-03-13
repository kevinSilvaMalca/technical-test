import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../domain/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Valid email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Secret123!', description: 'Minimum 6 characters', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.CUSTOMER,
    description:
      'Role to assign. Omit for public registration (always customer). ' +
      'Admin can assign any role. Manager can only assign customer.',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
