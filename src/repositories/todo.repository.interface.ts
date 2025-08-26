import { TodoEntity } from '../entities/todo.entity';

export interface ITodoRepository {
  create(todo: Partial<TodoEntity>): Promise<TodoEntity>;
  findAll(): Promise<TodoEntity[]>;
  findById(id: string): Promise<TodoEntity | null>;
  findByStatus(completed: boolean): Promise<TodoEntity[]>;
  findByPriority(priority: 'low' | 'medium' | 'high'): Promise<TodoEntity[]>;
  findOverdue(): Promise<TodoEntity[]>;
  update(id: string, updateData: Partial<TodoEntity>): Promise<TodoEntity>;
  delete(id: string): Promise<void>;
  save(todo: TodoEntity): Promise<TodoEntity>;
  findByTitleSearch(searchTerm: string): Promise<TodoEntity[]>;
  countByStatus(): Promise<{ completed: number; pending: number }>;
}
