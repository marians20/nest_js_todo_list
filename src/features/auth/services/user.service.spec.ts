import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { UserEntity } from '../entities/user.entity';
import { RegisterUserDto, LoginUserDto } from '../dto/user.dto';
import { JwtPayload } from '../types/auth.types';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const createMockUserEntity = (overrides: Partial<UserEntity> = {}): UserEntity => {
    const mockUser = new UserEntity();
    mockUser.id = 'user-123';
    mockUser.username = 'testuser';
    mockUser.email = 'test@example.com';
    mockUser.password = 'hashedpassword';
    mockUser.roles = ['user'];
    mockUser.createdAt = new Date('2024-01-01');
    mockUser.updatedAt = new Date('2024-01-01');

    Object.assign(mockUser, overrides);
    return mockUser;
  };

  const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      const mockUser = createMockUserEntity();
      const mockToken = 'jwt-token-123';

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      userRepository.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(registerDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(registerDto.username);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedpassword',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        roles: mockUser.roles,
      } as JwtPayload);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          roles: mockUser.roles,
          createdAt: mockUser.createdAt.toISOString(),
        },
        token: mockToken,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = createMockUserEntity();
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow('User with this email already exists');

      expect(userRepository.findByUsername).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      const existingUser = createMockUserEntity();
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow('User with this username already exists');

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully with valid credentials', async () => {
      const mockUser = createMockUserEntity();
      const mockToken = 'jwt-token-123';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        roles: mockUser.roles,
      } as JwtPayload);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          roles: mockUser.roles,
          createdAt: mockUser.createdAt.toISOString(),
        },
        token: mockToken,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = createMockUserEntity();
      userRepository.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      const mockUser = createMockUserEntity();
      const userId = 'user-123';

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent-user';
      userRepository.findById.mockResolvedValue(null);

      const result = await service.validateUser(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user response DTO when user found', async () => {
      const mockUser = createMockUserEntity();
      const userId = 'user-123';

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        roles: mockUser.roles,
        createdAt: mockUser.createdAt.toISOString(),
      });
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent-user';
      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users as response DTOs', async () => {
      const mockUsers = [createMockUserEntity(), createMockUserEntity({ id: 'user-456', username: 'testuser2', email: 'test2@example.com' })];

      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockUsers[0].id,
        username: mockUsers[0].username,
        email: mockUsers[0].email,
        roles: mockUsers[0].roles,
        createdAt: mockUsers[0].createdAt.toISOString(),
      });
    });

    it('should return empty array when no users exist', async () => {
      userRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
