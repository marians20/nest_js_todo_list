import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/user.dto';
import { IUserRepository } from './interfaces/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(userData: RegisterUserDto & { password: string }): Promise<UserEntity> {
    try {
      const user = this.userRepository.create({
        ...userData,
        roles: ['user'], // Default role
      });
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('User with this email or username already exists');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      select: ['id', 'username', 'email', 'roles', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity> {
    await this.userRepository.update(id, updateData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('User not found');
    }
  }
}
