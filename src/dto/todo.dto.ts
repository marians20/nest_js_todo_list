import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Priority } from '../types/common.types';

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the todo item',
    example: 'Learn NestJS',
    minLength: 1,
    maxLength: 200,
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the todo item',
    example: 'Complete the NestJS tutorial and build a todo list API',
    maxLength: 1000,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Due date for the todo item (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the todo item',
    enum: ['low', 'medium', 'high'],
    example: 'high',
    default: 'medium',
  })
  priority?: Priority;
}

export class UpdateTodoDto {
  @ApiPropertyOptional({
    description: 'Updated title of the todo item',
    example: 'Learn Advanced NestJS',
    minLength: 1,
    maxLength: 200,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the todo item',
    example: 'Complete advanced NestJS concepts including GraphQL and microservices',
    maxLength: 1000,
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Mark todo as completed or incomplete',
    example: true,
  })
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Updated due date for the todo item (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Updated priority level of the todo item',
    enum: ['low', 'medium', 'high'],
    example: 'high',
  })
  priority?: Priority;
}

export class TodoResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the todo item',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the todo item',
    example: 'Learn NestJS',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the todo item',
    example: 'Complete the NestJS tutorial and build a todo list API',
  })
  description?: string;

  @ApiProperty({
    description: 'Completion status of the todo item',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'Creation timestamp (ISO 8601 format)',
    example: '2024-08-26T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp (ISO 8601 format)',
    example: '2024-08-26T15:45:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'Due date of the todo item (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  dueDate?: string;

  @ApiProperty({
    description: 'Priority level of the todo item',
    enum: ['low', 'medium', 'high'],
    example: 'high',
  })
  priority: Priority;

  @ApiProperty({
    description: 'Whether the todo item is overdue',
    example: false,
  })
  isOverdue: boolean;

  @ApiPropertyOptional({
    description: 'Number of days until due date (negative if overdue)',
    example: 5,
  })
  daysUntilDue: number | null;
}
