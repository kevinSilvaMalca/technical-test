import {
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    example: '64a1b2c3d4e5f6a7b8c9d0e1',
    description: 'MongoDB ObjectId of the product',
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    example: 2,
    description: 'Number of units (minimum 1)',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    example: 10.0,
    description: 'Fixed discount amount applied to this line item (default 0)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: 'Alice Johnson',
    description: 'Full name of the client',
  })
  @IsString()
  clientName!: string;

  @ApiProperty({
    example: 'alice.johnson@example.com',
    description: 'Email address of the client',
  })
  @IsEmail()
  clientEmail!: string;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'List of order items (minimum 1 item required)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiProperty({
    example: 0.1,
    description: 'Tax amount added to subtotal. e.g. 0.1 = 10% of subtotal',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  tax!: number;
}
