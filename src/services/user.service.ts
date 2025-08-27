import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserDto, LoginUserDto, UserResponseDto } from '../dto/user.dto';
import { JwtPayload } from '../types/auth.types';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<{ user: UserResponseDto; token: string }> {
    // Check if user already exists
    const existingUserByEmail = await this.userRepository.findByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserByUsername = await this.userRepository.findByUsername(registerDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  async login(loginDto: LoginUserDto): Promise<{ user: UserResponseDto; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  async validateUser(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findById(userId);
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toUserResponse(user) : null;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => this.toUserResponse(user));
  }

  private generateToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }

  private toUserResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
