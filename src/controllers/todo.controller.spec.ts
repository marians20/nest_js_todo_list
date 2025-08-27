import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from '../services/todo.service';
import { CreateTodoDto, UpdateTodoDto, TodoResponseDto } from '../dto/todo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('TodoController', () => {
  let controller: TodoController;
  let service: jest.Mocked<TodoService>;

  const mockTodoResponse: TodoResponseDto = {
    id: 'todo-123',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    dueDate: '2024-12-31T23:59:59.000Z',
    priority: 'medium',
    isOverdue: false,
    daysUntilDue: 30,
  };

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  } as any;

  const mockTodoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStatus: jest.fn(),
    findByPriority: jest.fn(),
    findOverdue: jest.fn(),
    markCompleted: jest.fn(),
    markIncomplete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService) as jest.Mocked<TodoService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
      };

      service.create.mockResolvedValue(mockTodoResponse);

      const result = await controller.create(createTodoDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createTodoDto, mockUser.id);
      expect(result).toBe(mockTodoResponse);
    });
  });

  describe('findAll', () => {
    it('should return all todos for user', async () => {
      const mockTodos = [mockTodoResponse];
      service.findAll.mockResolvedValue(mockTodos);

      const result = await controller.findAll('', '', mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(mockTodos);
    });

    it('should filter by completed status', async () => {
      const mockTodos = [{ ...mockTodoResponse, completed: true }];
      service.findByStatus.mockResolvedValue(mockTodos);

      const result = await controller.findAll('completed', '', mockRequest);

      expect(service.findByStatus).toHaveBeenCalledWith(true, mockUser.id);
      expect(result).toBe(mockTodos);
    });

    it('should filter by pending status', async () => {
      const mockTodos = [mockTodoResponse];
      service.findByStatus.mockResolvedValue(mockTodos);

      const result = await controller.findAll('pending', '', mockRequest);

      expect(service.findByStatus).toHaveBeenCalledWith(false, mockUser.id);
      expect(result).toBe(mockTodos);
    });

    it('should filter by priority', async () => {
      const mockTodos = [{ ...mockTodoResponse, priority: 'high' as const }];
      service.findByPriority.mockResolvedValue(mockTodos);

      const result = await controller.findAll('', 'high', mockRequest);

      expect(service.findByPriority).toHaveBeenCalledWith('high', mockUser.id);
      expect(result).toBe(mockTodos);
    });
  });

  describe('findOverdue', () => {
    it('should return overdue todos', async () => {
      const mockOverdueTodos = [{ ...mockTodoResponse, isOverdue: true }];
      service.findOverdue.mockResolvedValue(mockOverdueTodos);

      const result = await controller.findOverdue(mockRequest);

      expect(service.findOverdue).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(mockOverdueTodos);
    });
  });

  describe('findOne', () => {
    it('should return a specific todo', async () => {
      const todoId = 'todo-123';
      service.findOne.mockResolvedValue(mockTodoResponse);

      const result = await controller.findOne(todoId, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(todoId, mockUser.id);
      expect(result).toBe(mockTodoResponse);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todoId = 'todo-123';
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
        completed: true,
      };
      const updatedTodo = { ...mockTodoResponse, title: 'Updated Title', completed: true };

      service.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(todoId, updateTodoDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(todoId, updateTodoDto, mockUser.id);
      expect(result).toBe(updatedTodo);
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      const todoId = 'todo-123';
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(todoId, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(todoId, mockUser.id);
      expect(result).toEqual({
        message: `Todo with ID ${todoId} has been deleted`,
      });
    });
  });

  describe('markCompleted', () => {
    it('should mark a todo as completed', async () => {
      const todoId = 'todo-123';
      const completedTodo = { ...mockTodoResponse, completed: true };

      service.markCompleted.mockResolvedValue(completedTodo);

      const result = await controller.markCompleted(todoId, mockRequest);

      expect(service.markCompleted).toHaveBeenCalledWith(todoId, mockUser.id);
      expect(result).toBe(completedTodo);
    });
  });

  describe('markIncomplete', () => {
    it('should mark a todo as incomplete', async () => {
      const todoId = 'todo-123';
      const incompleteTodo = { ...mockTodoResponse, completed: false };

      service.markIncomplete.mockResolvedValue(incompleteTodo);

      const result = await controller.markIncomplete(todoId, mockRequest);

      expect(service.markIncomplete).toHaveBeenCalledWith(todoId, mockUser.id);
      expect(result).toBe(incompleteTodo);
    });
  });
});
