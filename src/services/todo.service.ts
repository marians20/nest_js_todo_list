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

  async create(createTodoDto: CreateTodoDto): Promise<TodoResponseDto> {
    const todoData: Partial<TodoEntity> = {
      title: createTodoDto.title,
      description: createTodoDto.description,
      dueDate: createTodoDto.dueDate
        ? new Date(createTodoDto.dueDate)
        : undefined,
      priority: createTodoDto.priority || 'medium',
      completed: false,
    };

    const todo = await this.todoRepository.create(todoData);
    return this.toResponseDto(todo);
  }

  async findAll(): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findAll();
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async findOne(id: string): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return this.toResponseDto(todo);
  }

  async update(
    id: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<TodoResponseDto> {
    const updateData: Partial<TodoEntity> = {};

    if (updateTodoDto.title !== undefined) {
      updateData.title = updateTodoDto.title;
    }
    if (updateTodoDto.description !== undefined) {
      updateData.description = updateTodoDto.description;
    }
    if (updateTodoDto.completed !== undefined) {
      updateData.completed = updateTodoDto.completed;
    }
    if (updateTodoDto.dueDate !== undefined) {
      updateData.dueDate = new Date(updateTodoDto.dueDate);
    }
    if (updateTodoDto.priority !== undefined) {
      updateData.priority = updateTodoDto.priority;
    }

    const todo = await this.todoRepository.update(id, updateData);
    return this.toResponseDto(todo);
  }

  async remove(id: string): Promise<void> {
    await this.todoRepository.delete(id);
  }

  async findByStatus(completed: boolean): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findByStatus(completed);
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async findByPriority(
    priority: 'low' | 'medium' | 'high',
  ): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findByPriority(priority);
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async findOverdue(): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findOverdue();
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async markCompleted(id: string): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    
    todo.markCompleted();
    const updatedTodo = await this.todoRepository.save(todo);
    return this.toResponseDto(updatedTodo);
  }

  async markIncomplete(id: string): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    
    todo.markIncomplete();
    const updatedTodo = await this.todoRepository.save(todo);
    return this.toResponseDto(updatedTodo);
  }

  // Additional service methods
  async searchTodos(searchTerm: string): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findByTitleSearch(searchTerm);
    return todos.map((todo) => this.toResponseDto(todo));
  }

  async getTodoStats(): Promise<{
    completed: number;
    pending: number;
    overdue: number;
  }> {
    const stats = await this.todoRepository.countByStatus();
    const overdueTodos = await this.todoRepository.findOverdue();
    return {
      ...stats,
      overdue: overdueTodos.length,
    };
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
