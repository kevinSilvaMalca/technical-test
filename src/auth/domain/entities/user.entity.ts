import { Role } from '../enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: Role;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt'>,
  ): User {
    const now = new Date();
    return new User({ ...props, createdAt: now, updatedAt: now });
  }

  withUpdates(updates: Partial<Omit<UserProps, 'id' | 'createdAt'>>): User {
    return new User({
      id: this.id,
      email: updates.email ?? this.email,
      passwordHash: updates.passwordHash ?? this.passwordHash,
      role: updates.role ?? this.role,
      status: updates.status ?? this.status,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
