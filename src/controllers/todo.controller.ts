import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TodoService } from '../services/todo.service';
import { CreateTodoDto, UpdateTodoDto, TodoResponseDto } from '../dto/todo.dto';

@ApiTags('todos')
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new todo',
    description: 'Creates a new todo item with the provided details',
  })
  @ApiBody({ type: CreateTodoDto })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all todos',
    description:
      'Retrieves all todos with optional filtering by status and priority',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['completed', 'pending'],
    description: 'Filter todos by completion status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['low', 'medium', 'high'],
    description: 'Filter todos by priority level',
  })
  @ApiResponse({
    status: 200,
    description: 'List of todos retrieved successfully',
    type: [TodoResponseDto],
  })
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    if (status === 'completed') {
      return this.todoService.findByStatus(true);
    }
    if (status === 'pending') {
      return this.todoService.findByStatus(false);
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      return this.todoService.findByPriority(
        priority as 'low' | 'medium' | 'high',
      );
    }
    return this.todoService.findAll();
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'Get overdue todos',
    description:
      'Retrieves all todos that are past their due date and not completed',
  })
  @ApiResponse({
    status: 200,
    description: 'List of overdue todos retrieved successfully',
    type: [TodoResponseDto],
  })
  findOverdue() {
    return this.todoService.findOverdue();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific todo',
    description: 'Retrieves a todo item by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the todo item',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo retrieved successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a todo',
    description: 'Updates a todo item with the provided changes',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the todo item',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTodoDto })
  @ApiResponse({
    status: 200,
    description: 'Todo updated successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a todo',
    description: 'Permanently removes a todo item from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the todo item',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Todo with ID 550e8400-e29b-41d4-a716-446655440000 has been deleted',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  remove(@Param('id') id: string) {
    this.todoService.remove(id);
    return { message: `Todo with ID ${id} has been deleted` };
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Mark todo as completed',
    description: 'Marks a specific todo item as completed',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the todo item',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo marked as completed successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  markCompleted(@Param('id') id: string) {
    return this.todoService.markCompleted(id);
  }

  @Patch(':id/incomplete')
  @ApiOperation({
    summary: 'Mark todo as incomplete',
    description: 'Marks a specific todo item as incomplete',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the todo item',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo marked as incomplete successfully',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  markIncomplete(@Param('id') id: string) {
    return this.todoService.markIncomplete(id);
  }
}
