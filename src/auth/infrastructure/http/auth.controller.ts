import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user/login-user.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user/get-current-user.use-case';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { JwtPayload } from '../../application/ports/jwt-service.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Public endpoint. When called without authentication the role is always **customer**. ' +
      'An authenticated **admin** can create users with any role. ' +
      'An authenticated **manager** can only create **customer** users.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: { id: '64a1b2c3d4e5f6a7b8c9d0e1', email: 'user@example.com', role: 'customer', status: 'active' },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error or email already registered' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions to assign the requested role' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'Validates credentials and returns a signed JWT. Use the token in the **Authorization: Bearer** header for protected endpoints.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful — returns JWT',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.loginUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current authenticated user', description: 'Returns the profile of the user associated with the provided JWT.' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      example: { id: '64a1b2c3d4e5f6a7b8c9d0e1', email: 'admin@technical-test.com', role: 'admin', status: 'active' },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  async me(@CurrentUser() user: JwtPayload) {
    const found = await this.getCurrentUserUseCase.execute(user.sub);
    return {
      id: found.id,
      email: found.email,
      role: found.role,
      status: found.status,
    };
  }
}
