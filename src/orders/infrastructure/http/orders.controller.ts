import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderUseCase } from '../../application/use-cases/create-order/create-order.use-case';
import { UpdateOrderUseCase } from '../../application/use-cases/update-order/update-order.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order/get-order.use-case';
import { ListOrdersUseCase } from '../../application/use-cases/list-orders/list-orders.use-case';
import { GetMonthTotalUseCase } from '../../application/use-cases/get-month-total/get-month-total.use-case';
import { GetHighestTotalUseCase } from '../../application/use-cases/get-highest-total/get-highest-total.use-case';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getMonthTotalUseCase: GetMonthTotalUseCase,
    private readonly getHighestTotalUseCase: GetHighestTotalUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create order',
    description:
      'Creates a new order with status **pending**. ' +
      'Each item requires a valid productId and quantity. ' +
      'lineTotal = (unitPrice × quantity) − discount. ' +
      'subtotal = Σ lineTotals. total = subtotal + tax.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created',
    schema: {
      example: {
        id: '...', identifier: 'uuid-v4', clientName: 'Alice Johnson',
        clientEmail: 'alice@example.com', subtotal: 999.99, tax: 100.00,
        total: 1099.99, status: 'pending', items: [],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Empty items, product not found, or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  async create(@Body() dto: CreateOrderDto) {
    return this.createOrderUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all orders', description: 'Returns all orders in the system. Requires authentication (any role).' })
  @ApiResponse({ status: 200, description: 'Array of orders' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  async findAll() {
    return this.listOrdersUseCase.execute();
  }

  @Get('stats/month-total')
  @ApiOperation({
    summary: 'Current month total revenue',
    description: 'Returns the sum of **total** fields for all orders created in the current calendar month.',
  })
  @ApiResponse({ status: 200, description: 'Month total', schema: { example: { total: 24580.45 } } })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  async monthTotal() {
    const total = await this.getMonthTotalUseCase.execute();
    return { total };
  }

  @Get('stats/highest-total')
  @ApiOperation({
    summary: 'Order with highest total',
    description: 'Returns the single order with the highest **total** amount. Returns **null** if no orders exist.',
  })
  @ApiResponse({ status: 200, description: 'Order with highest total (or null)' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  async highestTotal() {
    return this.getHighestTotalUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID', description: 'Returns the full order details for the given MongoDB ObjectId.' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the order', example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    return this.getOrderUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update order',
    description:
      'All fields are optional. ' +
      'Fields (clientName, clientEmail, items, tax) can only be modified when status is **pending**. ' +
      'Status can be updated following the allowed transitions: ' +
      'pending→confirmed|cancelled · confirmed→shipped|cancelled · shipped→delivered.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the order', example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition or validation error' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.updateOrderUseCase.execute(id, dto);
  }
}
