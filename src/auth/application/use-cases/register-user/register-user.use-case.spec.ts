import { RegisterUserUseCase } from './register-user.use-case';
import { IUserRepository } from '../../../domain/ports/user-repository.interface';
import { Role } from '../../../domain/enums/role.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { User } from '../../../domain/entities/user.entity';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { UnauthorizedRoleAssignmentException } from '../../../domain/exceptions/unauthorized-role-assignment.exception';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const makeUser = (role: Role = Role.CUSTOMER) =>
    new User({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
      role,
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
    useCase = new RegisterUserUseCase(userRepository);
  });

  it('should register a customer by default when no role is provided', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(makeUser(Role.CUSTOMER));

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'Password1!',
    });

    expect(result.role).toBe(Role.CUSTOMER);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should register a customer when public endpoint is used (no requesterRole)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(makeUser(Role.CUSTOMER));

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'Password1!',
      role: Role.ADMIN,
    });

    expect(result.role).toBe(Role.CUSTOMER);
  });

  it('should allow admin to create a manager', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(makeUser(Role.MANAGER));

    const result = await useCase.execute({
      email: 'manager@example.com',
      password: 'Password1!',
      role: Role.MANAGER,
      requesterRole: Role.ADMIN,
    });

    expect(result.role).toBe(Role.MANAGER);
  });

  it('should allow admin to create an admin', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(makeUser(Role.ADMIN));

    const result = await useCase.execute({
      email: 'admin2@example.com',
      password: 'Password1!',
      role: Role.ADMIN,
      requesterRole: Role.ADMIN,
    });

    expect(result.role).toBe(Role.ADMIN);
  });

  it('should allow manager to create a customer', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(makeUser(Role.CUSTOMER));

    const result = await useCase.execute({
      email: 'customer@example.com',
      password: 'Password1!',
      role: Role.CUSTOMER,
      requesterRole: Role.MANAGER,
    });

    expect(result.role).toBe(Role.CUSTOMER);
  });

  it('should throw UnauthorizedRoleAssignmentException when manager tries to create admin', async () => {
    await expect(
      useCase.execute({
        email: 'admin@example.com',
        password: 'Password1!',
        role: Role.ADMIN,
        requesterRole: Role.MANAGER,
      }),
    ).rejects.toThrow(UnauthorizedRoleAssignmentException);
  });

  it('should throw UnauthorizedRoleAssignmentException when customer tries to create admin', async () => {
    await expect(
      useCase.execute({
        email: 'admin@example.com',
        password: 'Password1!',
        role: Role.ADMIN,
        requesterRole: Role.CUSTOMER,
      }),
    ).rejects.toThrow(UnauthorizedRoleAssignmentException);
  });

  it('should throw UserAlreadyExistsException when email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'Password1!' }),
    ).rejects.toThrow(UserAlreadyExistsException);
  });

  it('should hash the password before saving', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockImplementation(async (user) => user);

    await useCase.execute({ email: 'test@example.com', password: 'Password1!' });

    const savedUser = userRepository.save.mock.calls[0][0];
    expect(savedUser.passwordHash).not.toBe('Password1!');
    expect(savedUser.passwordHash.length).toBeGreaterThan(10);
  });
});
