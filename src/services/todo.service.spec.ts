import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { ITodoRepository } from '../repositories/todo.repository.interface';
import { TodoEntity } from '../entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto';

describe('TodoService', () => {
  let service: TodoService;
  let repository: jest.Mocked<ITodoRepository>;

  const createMockTodoEntity = (overrides: Partial<TodoEntity> = {}): TodoEntity => {
    const mockTodo = new TodoEntity();
    mockTodo.id = 'todo-123';
    mockTodo.title = 'Test Todo';
    mockTodo.description = 'Test Description';
    mockTodo.completed = false;
    mockTodo.createdAt = new Date('2024-01-01');
    mockTodo.updatedAt = new Date('2024-01-01');
    mockTodo.dueDate = new Date('2024-12-31');
    mockTodo.priority = 'medium';
    mockTodo.userId = 'user-123';

    // Apply any overrides
    Object.assign(mockTodo, overrides);

    return mockTodo;
  };

  const mockRepository = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findByIdAndUser: jest.fn(),
    updateByUser: jest.fn(),
    deleteByUser: jest.fn(),
    findByStatusAndUser: jest.fn(),
    findByPriorityAndUser: jest.fn(),
    findOverdueByUser: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: 'ITodoRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get('ITodoRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new todo successfully', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
        dueDate: '2024-12-31T23:59:59.000Z',
        priority: 'high',
      };

      const userId = 'user-123';
      const mockTodo = createMockTodoEntity({ priority: 'high' });
      repository.create.mockResolvedValue(mockTodo);

      const result = await service.create(createTodoDto, userId);

      expect(repository.create).toHaveBeenCalledWith({
        title: createTodoDto.title,
        description: createTodoDto.description,
        dueDate: new Date(createTodoDto.dueDate!),
        priority: createTodoDto.priority,
        completed: false,
        userId,
      });

      expect(result).toEqual({
        id: mockTodo.id,
        title: mockTodo.title,
        description: mockTodo.description,
        completed: mockTodo.completed,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
        dueDate: mockTodo.dueDate?.toISOString(),
        priority: mockTodo.priority,
        isOverdue: mockTodo.isOverdue(),
        daysUntilDue: mockTodo.getDaysUntilDue(),
      });
    });

    it('should create a todo with default priority when not provided', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };

      const userId = 'user-123';
      const mockTodo = createMockTodoEntity();
      repository.create.mockResolvedValue(mockTodo);

      await service.create(createTodoDto, userId);

      expect(repository.create).toHaveBeenCalledWith({
        title: createTodoDto.title,
        description: createTodoDto.description,
        dueDate: undefined,
        priority: 'medium',
        completed: false,
        userId,
      });
    });
  });

  describe('findAll', () => {
    it('should return all todos for a user', async () => {
      const userId = 'user-123';
      const mockTodos = [createMockTodoEntity()];
      repository.findAllByUser.mockResolvedValue(mockTodos);

      const result = await service.findAll(userId);

      expect(repository.findAllByUser).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockTodos[0].id);
    });

    it('should return empty array when user has no todos', async () => {
      const userId = 'user-123';
      repository.findAllByUser.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(repository.findAllByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific todo for a user', async () => {
      const todoId = 'todo-123';
      const userId = 'user-123';
      const mockTodo = createMockTodoEntity();
      repository.findByIdAndUser.mockResolvedValue(mockTodo);

      const result = await service.findOne(todoId, userId);

      expect(repository.findByIdAndUser).toHaveBeenCalledWith(todoId, userId);
      expect(result.id).toBe(mockTodo.id);
    });

    it('should throw NotFoundException when todo not found', async () => {
      const todoId = 'nonexistent-todo';
      const userId = 'user-123';
      repository.findByIdAndUser.mockResolvedValue(null);

      await expect(service.findOne(todoId, userId)).rejects.toThrow(NotFoundException);
      expect(repository.findByIdAndUser).toHaveBeenCalledWith(todoId, userId);
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {
      const todoId = 'todo-123';
      const userId = 'user-123';
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
        completed: true,
      };

      const updatedTodo = createMockTodoEntity({ title: 'Updated Title', completed: true });
      repository.updateByUser.mockResolvedValue(updatedTodo);

      const result = await service.update(todoId, updateTodoDto, userId);

      expect(repository.updateByUser).toHaveBeenCalledWith(
        todoId,
        expect.objectContaining({
          title: updateTodoDto.title,
          completed: updateTodoDto.completed,
        }),
        userId,
      );
      expect(result.title).toBe('Updated Title');
      expect(result.completed).toBe(true);
    });

    it('should throw NotFoundException when todo not found for update', async () => {
      const todoId = 'nonexistent-todo';
      const userId = 'user-123';
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Title' };

      repository.updateByUser.mockRejectedValue(new NotFoundException('Todo not found'));

      await expect(service.update(todoId, updateTodoDto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a todo successfully', async () => {
      const todoId = 'todo-123';
      const userId = 'user-123';

      repository.deleteByUser.mockResolvedValue(undefined);

      await service.remove(todoId, userId);

      expect(repository.deleteByUser).toHaveBeenCalledWith(todoId, userId);
    });

    it('should handle deletion error when todo not found', async () => {
      const todoId = 'nonexistent-todo';
      const userId = 'user-123';

      repository.deleteByUser.mockRejectedValue(new NotFoundException('Todo not found'));

      await expect(service.remove(todoId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStatus', () => {
    it('should return todos filtered by completion status', async () => {
      const userId = 'user-123';
      const completed = true;
      const mockCompletedTodos = [createMockTodoEntity({ completed: true })];

      repository.findByStatusAndUser.mockResolvedValue(mockCompletedTodos);

      const result = await service.findByStatus(completed, userId);

      expect(repository.findByStatusAndUser).toHaveBeenCalledWith(completed, userId);
      expect(result).toHaveLength(1);
      expect(result[0].completed).toBe(true);
    });
  });

  describe('findByPriority', () => {
    it('should return todos filtered by priority', async () => {
      const userId = 'user-123';
      const priority = 'high';
      const mockHighPriorityTodos = [createMockTodoEntity({ priority: 'high' })];

      repository.findByPriorityAndUser.mockResolvedValue(mockHighPriorityTodos);

      const result = await service.findByPriority(priority, userId);

      expect(repository.findByPriorityAndUser).toHaveBeenCalledWith(priority, userId);
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('high');
    });
  });

  describe('findOverdue', () => {
    it('should return overdue todos for a user', async () => {
      const userId = 'user-123';
      const mockOverdueTodos = [createMockTodoEntity()];

      repository.findOverdueByUser.mockResolvedValue(mockOverdueTodos);

      const result = await service.findOverdue(userId);

      expect(repository.findOverdueByUser).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
    });
  });

  describe('markCompleted', () => {
    it('should mark a todo as completed', async () => {
      const todoId = 'todo-123';
      const userId = 'user-123';
      const mockTodo = createMockTodoEntity();
      const completedTodo = createMockTodoEntity({ completed: true });

      repository.findByIdAndUser.mockResolvedValue(mockTodo);
      repository.save.mockResolvedValue(completedTodo);

      const result = await service.markCompleted(todoId, userId);

      expect(repository.findByIdAndUser).toHaveBeenCalledWith(todoId, userId);
      expect(repository.save).toHaveBeenCalledWith(mockTodo);
      expect(result.completed).toBe(true);
    });

    it('should throw NotFoundException when todo not found for completion', async () => {
      const todoId = 'nonexistent-todo';
      const userId = 'user-123';

      repository.findByIdAndUser.mockResolvedValue(null);

      await expect(service.markCompleted(todoId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markIncomplete', () => {
    it('should mark a todo as incomplete', async () => {
      const todoId = 'todo-123';
      const userId = 'user-123';
      const mockTodo = createMockTodoEntity({ completed: true });
      const incompleteTodo = createMockTodoEntity({ completed: false });

      repository.findByIdAndUser.mockResolvedValue(mockTodo);
      repository.save.mockResolvedValue(incompleteTodo);

      const result = await service.markIncomplete(todoId, userId);

      expect(repository.findByIdAndUser).toHaveBeenCalledWith(todoId, userId);
      expect(repository.save).toHaveBeenCalledWith(mockTodo);
      expect(result.completed).toBe(false);
    });

    it('should throw NotFoundException when todo not found for marking incomplete', async () => {
      const todoId = 'nonexistent-todo';
      const userId = 'user-123';

      repository.findByIdAndUser.mockResolvedValue(null);

      await expect(service.markIncomplete(todoId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
