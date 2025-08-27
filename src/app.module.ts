import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { TodoEntity } from './entities/todo.entity';
import { UserEntity } from './entities/user.entity';
import { TodoRepository } from './repositories/todo.repository';
import { UserRepository } from './repositories/user.repository';
import { JwtStrategy } from './auth/jwt.strategy';

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
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // In production, use environment variable
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AppController, TodoController, AuthController],
  providers: [
    AppService,
    TodoService,
    UserService,
    JwtStrategy,
    {
      provide: 'ITodoRepository',
      useClass: TodoRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class AppModule {}
