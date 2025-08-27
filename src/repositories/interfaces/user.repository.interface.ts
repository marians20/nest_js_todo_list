import { UserEntity } from '../../entities/user.entity';
import { RegisterUserDto } from '../../dto/user.dto';

export interface IUserRepository {
  create(userData: RegisterUserDto & { password: string }): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
