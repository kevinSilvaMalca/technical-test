import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchemaClass, UserDocument } from '../schemas/user.schema';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email });
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async save(user: User): Promise<User> {
    const doc = new this.userModel({
      _id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(user: User): Promise<User> {
    const doc = await this.userModel.findByIdAndUpdate(
      user.id,
      {
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      },
      { new: true },
    );
    return this.toDomain(doc!);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  private toDomain(doc: UserDocument): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role as Role,
      status: doc.status as UserStatus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
