import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AuthModule } from './features/auth/auth.module';
import { TodosModule } from './features/todos/todos.module';
import { TodoEntity } from './features/todos/entities/todo.entity';
import { UserEntity } from './features/auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'todos.sqlite',
      entities: [TodoEntity, UserEntity],
      synchronize: true, // Only for development
      logging: false,
    }),
    TypeOrmModule.forFeature([TodoEntity, UserEntity]),
    AuthModule,
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
