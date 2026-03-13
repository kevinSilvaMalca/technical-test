export const JWT_SERVICE = 'IJwtService';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface IJwtService {
  sign(payload: JwtPayload): string;
}
