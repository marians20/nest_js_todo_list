import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';
import { TodoEntity } from './entities/todo.entity';
import { TodoRepository } from './repositories/todo.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'todos.sqlite',
      entities: [TodoEntity],
      synchronize: true, // Only for development
      logging: false,
    }),
    TypeOrmModule.forFeature([TodoEntity]),
  ],
  controllers: [AppController, TodoController],
  providers: [
    AppService,
    TodoService,
    {
      provide: 'ITodoRepository',
      useClass: TodoRepository,
    },
  ],
})
export class AppModule {}
