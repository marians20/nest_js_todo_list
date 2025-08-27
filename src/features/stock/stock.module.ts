import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Stock } from './entities/stock.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { ProductController } from './controllers/product.controller';
import { StockController } from './controllers/stock.controller';
import { StockMovementController } from './controllers/stock-movement.controller';
import { ProductService } from './services/product.service';
import { StockService } from './services/stock.service';
import { StockMovementService } from './services/stock-movement.service';
import { ProductRepository } from './repositories/product.repository';
import { StockRepository } from './repositories/stock.repository';
import { StockMovementRepository } from './repositories/stock-movement.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Stock, StockMovement]),
  ],
  controllers: [
    ProductController,
    StockController,
    StockMovementController,
  ],
  providers: [
    ProductService,
    StockService,
    StockMovementService,
    ProductRepository,
    StockRepository,
    StockMovementRepository,
  ],
  exports: [
    ProductService,
    StockService,
    StockMovementService,
  ],
})
export class StockModule {}
