import { IUserRepository } from '../../../domain/ports/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return user;
  }
}
