import { MongoUserRepository } from './mongo-user.repository';
import { Role } from '../../domain/enums/role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { User } from '../../domain/entities/user.entity';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';

type UserModelMock = jest.Mock & {
  findOne: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  save: jest.Mock;
};

describe('MongoUserRepository', () => {
  let repository: MongoUserRepository;
  let userModel: UserModelMock;

  const mockDoc = {
    _id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    role: Role.CUSTOMER,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    save: jest.fn(),
  };

  beforeEach(() => {
    const saveMock = jest.fn().mockResolvedValue(mockDoc);
    const ModelMock = jest
      .fn()
      .mockImplementation(() => ({ save: saveMock })) as UserModelMock;
    (ModelMock as unknown as { prototype: { save: jest.Mock } }).prototype = {
      save: saveMock,
    };

    userModel = Object.assign(ModelMock, {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: saveMock,
    });

    repository = new MongoUserRepository(
      userModel as unknown as Model<UserDocument>,
    );
  });

  describe('findByEmail', () => {
    it('should return a User when document is found', async () => {
      userModel.findOne.mockResolvedValue(mockDoc);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when document is not found', async () => {
      userModel.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a User when document is found', async () => {
      userModel.findById.mockResolvedValue(mockDoc);

      const result = await repository.findById('user-1');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-1');
    });

    it('should return null when document is not found', async () => {
      userModel.findById.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a user and return domain entity', async () => {
      const saveMock = jest.fn().mockResolvedValue(mockDoc);
      userModel.mockImplementation(() => ({ save: saveMock }));

      const user = new User({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.save(user);

      expect(saveMock).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('update', () => {
    it('should update a user and return domain entity', async () => {
      userModel.findByIdAndUpdate.mockResolvedValue(mockDoc);

      const user = new User({
        id: 'user-1',
        email: 'updated@example.com',
        passwordHash: 'hashed',
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.update(user);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-1',
        expect.any(Object),
        { new: true },
      );
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      userModel.findByIdAndDelete.mockResolvedValue(mockDoc);

      await repository.delete('user-1');

      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('user-1');
    });
  });
});
