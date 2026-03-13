import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IUserRepository } from '../../../domain/ports/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Role } from '../../../domain/enums/role.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { UnauthorizedRoleAssignmentException } from '../../../domain/exceptions/unauthorized-role-assignment.exception';

export interface RegisterUserInput {
  email: string;
  password: string;
  role?: Role;
  requesterRole?: Role;
}

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const finalRole = this.resolveRole(input.role, input.requesterRole);

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new UserAlreadyExistsException(input.email);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = User.create({
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash,
      role: finalRole,
      status: UserStatus.ACTIVE,
    });

    return this.userRepository.save(user);
  }

  private resolveRole(requestedRole?: Role, requesterRole?: Role): Role {
    if (!requesterRole) {
      return Role.CUSTOMER;
    }

    const target = requestedRole ?? Role.CUSTOMER;

    if (requesterRole === Role.ADMIN) {
      return target;
    }

    if (requesterRole === Role.MANAGER) {
      if (target !== Role.CUSTOMER) {
        throw new UnauthorizedRoleAssignmentException(requesterRole, target);
      }
      return Role.CUSTOMER;
    }

    if (target !== Role.CUSTOMER) {
      throw new UnauthorizedRoleAssignmentException(requesterRole, target);
    }

    return Role.CUSTOMER;
  }
}
