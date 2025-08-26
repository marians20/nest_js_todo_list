export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export class TodoEntity implements Todo {
  constructor(
    public id: string,
    public title: string,
    public completed: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public description?: string,
    public dueDate?: Date,
    public priority: 'low' | 'medium' | 'high' = 'medium',
  ) {}

  markCompleted(): void {
    this.completed = true;
    this.updatedAt = new Date();
  }

  markIncomplete(): void {
    this.completed = false;
    this.updatedAt = new Date();
  }

  updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  updatePriority(priority: 'low' | 'medium' | 'high'): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  updateDueDate(dueDate: Date): void {
    this.dueDate = dueDate;
    this.updatedAt = new Date();
  }

  isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && !this.completed;
  }

  getDaysUntilDue(): number | null {
    if (!this.dueDate) return null;
    const today = new Date();
    const timeDiff = this.dueDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
