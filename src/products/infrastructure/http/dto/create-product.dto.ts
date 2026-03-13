import {
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../../domain/enums/product-status.enum';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro', description: 'Product display name' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'SPH-001', description: 'Unique Stock Keeping Unit identifier' })
  @IsString()
  sku!: string;

  @ApiProperty({ example: 'Apple iPhone 15 Pro with A17 Pro chip', description: 'Full product description' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'https://example.com/iphone15pro.jpg', description: 'URL of the product image' })
  @IsOptional()
  @IsUrl()
  picture?: string;

  @ApiProperty({ example: 999.99, description: 'Price in USD (must be positive)' })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 50, description: 'Available stock units (0 or more)' })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({
    example: 'Smartphones',
    description: 'Product category. Suggested values: Smartphones, Laptops, Tablets, Accessories, Gaming, Audio, Networking, Monitors',
  })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE, description: 'Product visibility status. Defaults to active.' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: ['apple', 'ios', 'flagship'], description: 'Optional array of searchable tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
