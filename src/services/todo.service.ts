import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { TodoEntity } from '../entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto, TodoResponseDto } from '../dto/todo.dto';
import type { ITodoRepository } from '../repositories/todo.repository.interface';

@Injectable()
export class TodoService {
  constructor(
    @Inject('ITodoRepository')
    private readonly todoRepository: ITodoRepository,
  ) {}

  async create(
    createTodoDto: CreateTodoDto,
    userId: string,
  ): Promise<TodoResponseDto> {
    const todoData: Partial<TodoEntity> = {
      title: createTodoDto.title,
      description: createTodoDto.description,
      dueDate: createTodoDto.dueDate
        ? new Date(createTodoDto.dueDate)
        : undefined,
      priority: createTodoDto.priority || 'medium',
      completed: false,
      userId,
    };

    const todo = await this.todoRepository.create(todoData);
    return this.toResponseDto(todo);
  }

  async findAll(userId: string): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findAllByUser(userId);
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async findOne(id: string, userId: string): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findByIdAndUser(id, userId);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return this.toResponseDto(todo);
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<TodoResponseDto> {
    const updateData: Partial<TodoEntity> = {
      ...(updateTodoDto.title && { title: updateTodoDto.title }),
      ...(updateTodoDto.description !== undefined && {
        description: updateTodoDto.description,
      }),
      ...(updateTodoDto.dueDate && {
        dueDate: new Date(updateTodoDto.dueDate),
      }),
      ...(updateTodoDto.priority && { priority: updateTodoDto.priority }),
      ...(updateTodoDto.completed !== undefined && {
        completed: updateTodoDto.completed,
      }),
    };

    const todo = await this.todoRepository.updateByUser(id, updateData, userId);
    return this.toResponseDto(todo);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.todoRepository.deleteByUser(id, userId);
  }

  async findByStatus(completed: boolean, userId: string): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findByStatusAndUser(completed, userId);
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async findByPriority(
    priority: 'low' | 'medium' | 'high',
    userId: string,
  ): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findByPriorityAndUser(priority, userId);
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async findOverdue(userId: string): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findOverdueByUser(userId);
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async markCompleted(id: string, userId: string): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findByIdAndUser(id, userId);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    todo.markCompleted();
    const updatedTodo = await this.todoRepository.save(todo);
    return this.toResponseDto(updatedTodo);
  }

  async markIncomplete(id: string, userId: string): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findByIdAndUser(id, userId);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    todo.markIncomplete();
    const updatedTodo = await this.todoRepository.save(todo);
    return this.toResponseDto(updatedTodo);
  }

  private toResponseDto(todo: TodoEntity): TodoResponseDto {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
      dueDate: todo.dueDate?.toISOString(),
      priority: todo.priority,
      isOverdue: todo.isOverdue(),
      daysUntilDue: todo.getDaysUntilDue(),
    };
  }
}
