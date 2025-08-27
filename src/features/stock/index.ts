// Entities
export { Product } from './entities/product.entity';
export { Stock } from './entities/stock.entity';
export { StockMovement, MovementType, MovementReason } from './entities/stock-movement.entity';

// DTOs
export { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export { CreateStockDto, UpdateStockDto } from './dto/stock.dto';
export { CreateStockMovementDto, StockAdjustmentDto } from './dto/stock-movement.dto';

// Services
export { ProductService } from './services/product.service';
export { StockService } from './services/stock.service';
export { StockMovementService } from './services/stock-movement.service';

// Controllers
export { ProductController } from './controllers/product.controller';
export { StockController } from './controllers/stock.controller';
export { StockMovementController } from './controllers/stock-movement.controller';

// Repositories
export { ProductRepository } from './repositories/product.repository';
export { StockRepository } from './repositories/stock.repository';
export { StockMovementRepository } from './repositories/stock-movement.repository';

// Module
export { StockModule } from './stock.module';
