import { GetCurrentUserUseCase } from './get-current-user.use-case';
import { IUserRepository } from '../../../domain/ports/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Role } from '../../../domain/enums/role.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = new User({
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
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
    useCase = new GetCurrentUserUseCase(userRepository);
  });

  it('should return user when found by id', async () => {
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute('user-1');

    expect(result).toBe(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      UserNotFoundException,
    );
  });
});
