import { Injectable, NotFoundException } from '@nestjs/common';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { CreateStockMovementDto } from '../dto/stock-movement.dto';
import { StockMovement } from '../entities/stock-movement.entity';

@Injectable()
export class StockMovementService {
  constructor(
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async findAll(): Promise<StockMovement[]> {
    return this.stockMovementRepository.findAll();
  }

  async findOne(id: number): Promise<StockMovement> {
    const movement = await this.stockMovementRepository.findOne(id);
    if (!movement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }
    return movement;
  }

  async findByProduct(productId: number): Promise<StockMovement[]> {
    return this.stockMovementRepository.findByProduct(productId);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    return this.stockMovementRepository.findByDateRange(startDate, endDate);
  }

  async getMovementSummary(productId: number): Promise<{ totalIn: number; totalOut: number }> {
    return this.stockMovementRepository.getMovementSummary(productId);
  }

  async create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    return this.stockMovementRepository.create(createStockMovementDto);
  }
}
