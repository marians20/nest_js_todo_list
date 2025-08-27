import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';
import { ITodoRepository } from './interfaces/todo.repository.interface';
import type { Priority } from '../../../shared/types/common.types';

@Injectable()
export class TodoRepository implements ITodoRepository {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,
  ) {}

  async create(todoData: Partial<TodoEntity>): Promise<TodoEntity> {
    const todo = this.todoRepository.create(todoData);
    return await this.todoRepository.save(todo);
  }

  async findAll(): Promise<TodoEntity[]> {
    return await this.todoRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<TodoEntity | null> {
    return await this.todoRepository.findOne({ where: { id } });
  }

  async findByStatus(completed: boolean): Promise<TodoEntity[]> {
    return await this.todoRepository.find({
      where: { completed },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPriority(priority: Priority): Promise<TodoEntity[]> {
    return await this.todoRepository.find({
      where: { priority },
      order: { createdAt: 'DESC' },
    });
  }

  async findOverdue(): Promise<TodoEntity[]> {
    const now = new Date();
    return await this.todoRepository.find({
      where: {
        dueDate: LessThan(now),
        completed: false,
      },
      order: { dueDate: 'ASC' },
    });
  }

  async update(
    id: string,
    updateData: Partial<TodoEntity>,
  ): Promise<TodoEntity> {
    const todo = await this.findById(id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // Update the entity with new data
    Object.assign(todo, updateData);
    todo.updatedAt = new Date();

    return await this.todoRepository.save(todo);
  }

  async delete(id: string): Promise<void> {
    const result = await this.todoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
  }

  async save(todo: TodoEntity): Promise<TodoEntity> {
    return await this.todoRepository.save(todo);
  }

  // Additional query methods for complex operations
  async findByDateRange(startDate: Date, endDate: Date): Promise<TodoEntity[]> {
    return await this.todoRepository
      .createQueryBuilder('todo')
      .where('todo.dueDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('todo.dueDate', 'ASC')
      .getMany();
  }

  async countByStatus(): Promise<{ completed: number; pending: number }> {
    const completed = await this.todoRepository.count({
      where: { completed: true },
    });
    const pending = await this.todoRepository.count({
      where: { completed: false },
    });
    return { completed, pending };
  }

  async findByTitleSearch(searchTerm: string): Promise<TodoEntity[]> {
    return await this.todoRepository
      .createQueryBuilder('todo')
      .where('todo.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('todo.description LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('todo.createdAt', 'DESC')
      .getMany();
  }

  // User-specific methods
  async findAllByUser(userId: string): Promise<TodoEntity[]> {
    return await this.todoRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<TodoEntity | null> {
    return await this.todoRepository.findOne({ 
      where: { id, userId } 
    });
  }

  async findByStatusAndUser(completed: boolean, userId: string): Promise<TodoEntity[]> {
    return await this.todoRepository.find({
      where: { completed, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPriorityAndUser(priority: Priority, userId: string): Promise<TodoEntity[]> {
    return await this.todoRepository.find({
      where: { priority, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOverdueByUser(userId: string): Promise<TodoEntity[]> {
    const now = new Date();
    return await this.todoRepository
      .createQueryBuilder('todo')
      .where('todo.dueDate < :now', { now })
      .andWhere('todo.completed = :completed', { completed: false })
      .andWhere('todo.userId = :userId', { userId })
      .orderBy('todo.dueDate', 'ASC')
      .getMany();
  }

  async updateByUser(
    id: string,
    updateData: Partial<TodoEntity>,
    userId: string,
  ): Promise<TodoEntity> {
    const todo = await this.findByIdAndUser(id, userId);
    if (!todo) {
      throw new Error('Todo not found or access denied');
    }
    
    await this.todoRepository.update({ id, userId }, updateData);
    const updatedTodo = await this.findByIdAndUser(id, userId);
    if (!updatedTodo) {
      throw new Error('Failed to update todo');
    }
    return updatedTodo;
  }

  async deleteByUser(id: string, userId: string): Promise<void> {
    const result = await this.todoRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new Error('Todo not found or access denied');
    }
  }

  async findByTitleSearchAndUser(searchTerm: string, userId: string): Promise<TodoEntity[]> {
    return await this.todoRepository
      .createQueryBuilder('todo')
      .where('todo.title LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('todo.userId = :userId', { userId })
      .orderBy('todo.createdAt', 'DESC')
      .getMany();
  }

  async countByStatusAndUser(userId: string): Promise<{ completed: number; pending: number }> {
    const [completed, pending] = await Promise.all([
      this.todoRepository.count({ where: { completed: true, userId } }),
      this.todoRepository.count({ where: { completed: false, userId } }),
    ]);

    return { completed, pending };
  }
}
