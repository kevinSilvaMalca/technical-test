import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../domain/enums/role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';

export type UserDocument = HydratedDocument<UserSchemaClass>;

@Schema({ collection: 'users', timestamps: false })
export class UserSchemaClass {
  @Prop({ type: String })
  _id!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(Role),
    default: Role.CUSTOMER,
  })
  role!: Role;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Prop({ required: true })
  createdAt!: Date;

  @Prop({ required: true })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
