import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../domain/enums/order-status.enum';

export class UpdateOrderItemDto {
  @ApiPropertyOptional({ example: '64a1b2c3d4e5f6a7b8c9d0e1', description: 'MongoDB ObjectId of the product' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ example: 2, description: 'Number of units (minimum 1)', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 5.00, description: 'Fixed discount on this line', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 'Bob Martinez', description: "Client's full name" })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ example: 'bob@example.com', description: "Client's email address" })
  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @ApiPropertyOptional({ type: [UpdateOrderItemDto], description: 'Replace the full items list. Totals are recalculated automatically.' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiPropertyOptional({ example: 0.1, description: 'Tax rate applied to subtotal', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description:
      'Status transition. Valid transitions: ' +
      'pending→confirmed|cancelled · confirmed→shipped|cancelled · shipped→delivered. ' +
      'delivered and cancelled are final states.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
