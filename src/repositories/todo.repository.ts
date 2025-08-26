import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';
import { ITodoRepository } from './todo.repository.interface';

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

  async findByPriority(
    priority: 'low' | 'medium' | 'high',
  ): Promise<TodoEntity[]> {
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
}
