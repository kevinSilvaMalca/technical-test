import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  UserSchemaClass,
  UserSchema,
} from './infrastructure/schemas/user.schema';
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';
import { USER_REPOSITORY } from './domain/ports/user-repository.interface';
import { JWT_SERVICE } from './application/ports/jwt-service.interface';
import { RegisterUserUseCase } from './application/use-cases/register-user/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user/login-user.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user/get-current-user.use-case';
import { NestJwtService } from './infrastructure/services/nest-jwt.service';
import { AuthController } from './infrastructure/http/auth.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') ?? '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: MongoUserRepository },
    { provide: JWT_SERVICE, useClass: NestJwtService },
    {
      provide: RegisterUserUseCase,
      useFactory: (repo: MongoUserRepository) => new RegisterUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (repo: MongoUserRepository, jwt: NestJwtService) =>
        new LoginUserUseCase(repo, jwt),
      inject: [USER_REPOSITORY, JWT_SERVICE],
    },
    {
      provide: GetCurrentUserUseCase,
      useFactory: (repo: MongoUserRepository) =>
        new GetCurrentUserUseCase(repo),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    GetCurrentUserUseCase,
    USER_REPOSITORY,
    JwtModule,
  ],
})
export class AuthModule {}
