import { TodoEntity } from '../entities/todo.entity';
import type { Priority } from '../types/common.types';

export interface ITodoRepository {
  create(todo: Partial<TodoEntity>): Promise<TodoEntity>;
  findAll(): Promise<TodoEntity[]>;
  findAllByUser(userId: string): Promise<TodoEntity[]>;
  findById(id: string): Promise<TodoEntity | null>;
  findByIdAndUser(id: string, userId: string): Promise<TodoEntity | null>;
  findByStatus(completed: boolean): Promise<TodoEntity[]>;
  findByStatusAndUser(completed: boolean, userId: string): Promise<TodoEntity[]>;
  findByPriority(priority: Priority): Promise<TodoEntity[]>;
  findByPriorityAndUser(priority: Priority, userId: string): Promise<TodoEntity[]>;
  findOverdue(): Promise<TodoEntity[]>;
  findOverdueByUser(userId: string): Promise<TodoEntity[]>;
  update(id: string, updateData: Partial<TodoEntity>): Promise<TodoEntity>;
  updateByUser(id: string, updateData: Partial<TodoEntity>, userId: string): Promise<TodoEntity>;
  delete(id: string): Promise<void>;
  deleteByUser(id: string, userId: string): Promise<void>;
  save(todo: TodoEntity): Promise<TodoEntity>;
  findByTitleSearch(searchTerm: string): Promise<TodoEntity[]>;
  findByTitleSearchAndUser(searchTerm: string, userId: string): Promise<TodoEntity[]>;
  countByStatus(): Promise<{ completed: number; pending: number }>;
  countByStatusAndUser(userId: string): Promise<{ completed: number; pending: number }>;
}
