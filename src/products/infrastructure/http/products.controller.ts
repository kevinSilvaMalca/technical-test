import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/create-product/create-product.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product/get-product.use-case';
import { SearchProductsUseCase } from '../../application/use-cases/search-products/search-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product/delete-product.use-case';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../auth/domain/enums/role.enum';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create product', description: 'Creates a new product in the catalog. Requires **admin** or **manager** role.' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate SKU' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Insufficient role (customer cannot create products)' })
  async create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute({
      name: dto.name,
      sku: dto.sku,
      description: dto.description,
      picture: dto.picture ?? '',
      price: dto.price,
      stock: dto.stock,
      category: dto.category,
      status: dto.status,
      tags: dto.tags,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Search products',
    description: 'Public endpoint. Returns a paginated list of products. Supports filtering by category, status, and price range, plus sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    schema: {
      example: {
        data: [{ id: '...', name: 'iPhone 15 Pro', sku: 'SPH-001', price: 999.99, stock: 50, category: 'Smartphones', status: 'active' }],
        total: 40,
        page: 1,
        limit: 10,
      },
    },
  })
  async search(@Query() query: SearchProductsDto) {
    return this.searchProductsUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID', description: 'Public endpoint. Returns the full product data for the given MongoDB ObjectId.' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the product', example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.getProductUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update product', description: 'Partial update of a product. All fields are optional. Requires **admin** or **manager** role.' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the product', example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate SKU' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Insufficient role' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete product', description: 'Permanently deletes a product. **Admin only.**' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the product', example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @ApiResponse({ status: 204, description: 'Product deleted — no content returned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Insufficient role (manager and customer cannot delete)' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    await this.deleteProductUseCase.execute(id);
  }
}
