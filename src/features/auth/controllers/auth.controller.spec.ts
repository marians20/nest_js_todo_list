import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../services/user.service';
import { RegisterUserDto, LoginUserDto } from '../dto/user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<UserService>;

  const mockUserResponse = {
    user: {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    token: 'mock-jwt-token',
  };

  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<UserService>(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      service.register.mockResolvedValue(mockUserResponse);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(mockUserResponse);
      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should handle registration with minimum valid data', async () => {
      const registerDto: RegisterUserDto = {
        username: 'user2',
        email: 'user2@test.com',
        password: 'pass123',
      };

      const response = {
        user: {
          id: 'user-456',
          username: 'user2',
          email: 'user2@test.com',
          roles: ['user'],
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        token: 'another-jwt-token',
      };

      service.register.mockResolvedValue(response);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(response);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login.mockResolvedValue(mockUserResponse);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(mockUserResponse);
      expect(result.user.username).toBe('testuser');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should handle login with different email', async () => {
      const loginDto: LoginUserDto = {
        email: 'user2@test.com',
        password: 'password123',
      };

      service.login.mockResolvedValue(mockUserResponse);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBe(mockUserResponse);
    });
  });
});
