import { User } from './user.entity';
import { Role } from '../enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';

describe('User Entity', () => {
  const baseProps = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: Role.CUSTOMER,
    status: UserStatus.ACTIVE,
  };

  describe('create', () => {
    it('should create a user with all required fields', () => {
      const user = User.create(baseProps);

      expect(user.id).toBe('user-1');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashed-password');
      expect(user.role).toBe(Role.CUSTOMER);
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    it('should set createdAt and updatedAt on creation', () => {
      const before = new Date();
      const user = User.create(baseProps);
      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should create admin user with admin role', () => {
      const user = User.create({ ...baseProps, role: Role.ADMIN });
      expect(user.role).toBe(Role.ADMIN);
    });

    it('should create manager user with manager role', () => {
      const user = User.create({ ...baseProps, role: Role.MANAGER });
      expect(user.role).toBe(Role.MANAGER);
    });

    it('should create inactive user', () => {
      const user = User.create({ ...baseProps, status: UserStatus.INACTIVE });
      expect(user.status).toBe(UserStatus.INACTIVE);
    });
  });

  describe('constructor', () => {
    it('should construct user with explicit timestamps', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const user = new User({ ...baseProps, createdAt, updatedAt });

      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });

  describe('withUpdates', () => {
    it('should return a new user with updated fields', () => {
      const user = User.create(baseProps);
      const updated = user.withUpdates({ role: Role.ADMIN });

      expect(updated.role).toBe(Role.ADMIN);
      expect(updated.id).toBe(user.id);
      expect(updated.email).toBe(user.email);
    });

    it('should update updatedAt when applying updates', () => {
      const user = User.create(baseProps);
      const before = new Date();
      const updated = user.withUpdates({ status: UserStatus.INACTIVE });
      const after = new Date();

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(updated.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should preserve createdAt when applying updates', () => {
      const user = User.create(baseProps);
      const updated = user.withUpdates({ email: 'new@example.com' });

      expect(updated.createdAt).toBe(user.createdAt);
    });

    it('should not mutate the original user', () => {
      const user = User.create(baseProps);
      user.withUpdates({ role: Role.ADMIN });

      expect(user.role).toBe(Role.CUSTOMER);
    });
  });
});
