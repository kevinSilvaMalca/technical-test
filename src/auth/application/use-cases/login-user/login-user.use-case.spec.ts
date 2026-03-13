import { LoginUserUseCase } from './login-user.use-case';
import { IUserRepository } from '../../../domain/ports/user-repository.interface';
import { IJwtService } from '../../ports/jwt-service.interface';
import { User } from '../../../domain/entities/user.entity';
import { Role } from '../../../domain/enums/role.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import * as bcrypt from 'bcrypt';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<IJwtService>;

  const makeUser = async () =>
    new User({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('Password1!', 10),
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };
    useCase = new LoginUserUseCase(userRepository, jwtService);
  });

  it('should return a token when credentials are valid', async () => {
    const user = await makeUser();
    userRepository.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'Password1!',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'test@example.com',
      role: Role.CUSTOMER,
    });
  });

  it('should throw InvalidCredentialsException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'notfound@example.com', password: 'Password1!' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password is wrong', async () => {
    const user = await makeUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'WrongPass!' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
