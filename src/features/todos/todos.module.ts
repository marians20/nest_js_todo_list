import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';
import { TodoRepository } from './repositories/todo.repository';
import { TodoEntity } from './entities/todo.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoEntity]),
    AuthModule, // Import AuthModule to use JwtAuthGuard
  ],
  controllers: [TodoController],
  providers: [
    TodoService,
    {
      provide: 'ITodoRepository',
      useClass: TodoRepository,
    },
  ],
  exports: [TodoService],
})
export class TodosModule {}
