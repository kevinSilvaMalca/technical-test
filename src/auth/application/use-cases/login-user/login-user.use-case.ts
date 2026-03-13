import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../../domain/ports/user-repository.interface';
import { IJwtService } from '../../ports/jwt-service.interface';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  accessToken: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }
}
