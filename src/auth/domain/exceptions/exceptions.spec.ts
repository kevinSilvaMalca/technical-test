import { UserAlreadyExistsException } from './user-already-exists.exception';
import { UserNotFoundException } from './user-not-found.exception';
import { InvalidCredentialsException } from './invalid-credentials.exception';
import { UnauthorizedRoleAssignmentException } from './unauthorized-role-assignment.exception';

describe('Auth Domain Exceptions', () => {
  it('UserAlreadyExistsException should have correct message and name', () => {
    const err = new UserAlreadyExistsException('test@example.com');
    expect(err.message).toBe("User with email 'test@example.com' already exists");
    expect(err.name).toBe('UserAlreadyExistsException');
    expect(err).toBeInstanceOf(Error);
  });

  it('UserNotFoundException should have correct message and name', () => {
    const err = new UserNotFoundException('user-1');
    expect(err.message).toBe("User with id 'user-1' not found");
    expect(err.name).toBe('UserNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('InvalidCredentialsException should have correct message and name', () => {
    const err = new InvalidCredentialsException();
    expect(err.message).toBe('Invalid email or password');
    expect(err.name).toBe('InvalidCredentialsException');
    expect(err).toBeInstanceOf(Error);
  });

  it('UnauthorizedRoleAssignmentException should have correct message and name', () => {
    const err = new UnauthorizedRoleAssignmentException('customer', 'admin');
    expect(err.message).toBe(
      "Role 'customer' is not authorized to assign role 'admin'",
    );
    expect(err.name).toBe('UnauthorizedRoleAssignmentException');
    expect(err).toBeInstanceOf(Error);
  });
});
