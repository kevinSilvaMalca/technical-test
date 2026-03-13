import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IJwtService,
  JwtPayload,
} from '../../application/ports/jwt-service.interface';

@Injectable()
export class NestJwtService implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
