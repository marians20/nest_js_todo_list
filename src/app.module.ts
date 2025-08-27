import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AuthModule } from './features/auth/auth.module';
import { TodosModule } from './features/todos/todos.module';
import { StockModule } from './features/stock/stock.module';
import { TodoEntity } from './features/todos/entities/todo.entity';
import { UserEntity } from './features/auth/entities/user.entity';
import { Product } from './features/stock/entities/product.entity';
import { Stock } from './features/stock/entities/stock.entity';
import { StockMovement } from './features/stock/entities/stock-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'todos.sqlite',
      entities: [TodoEntity, UserEntity, Product, Stock, StockMovement],
      synchronize: true, // Only for development
      logging: false,
    }),
    TypeOrmModule.forFeature([TodoEntity, UserEntity]),
    AuthModule,
    TodosModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
