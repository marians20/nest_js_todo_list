import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CreateStockDto, UpdateStockDto } from '../dto/stock.dto';
import { StockAdjustmentDto, CreateStockMovementDto } from '../dto/stock-movement.dto';
import { Stock } from '../entities/stock.entity';
import { MovementType, MovementReason } from '../entities/stock-movement.entity';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly stockMovementRepository: StockMovementRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    // Verify product exists
    const productExists = await this.productRepository.exists(createStockDto.productId);
    if (!productExists) {
      throw new NotFoundException(`Product with ID ${createStockDto.productId} not found`);
    }

    return this.stockRepository.create(createStockDto);
  }

  async findAll(): Promise<Stock[]> {
    return this.stockRepository.findAll();
  }

  async findOne(id: number): Promise<Stock> {
    const stock = await this.stockRepository.findOne(id);
    if (!stock) {
      throw new NotFoundException(`Stock record with ID ${id} not found`);
    }
    return stock;
  }

  async findByProduct(productId: number): Promise<Stock[]> {
    return this.stockRepository.findByProduct(productId);
  }

  async findByLocation(location: string): Promise<Stock[]> {
    return this.stockRepository.findByLocation(location);
  }

  async update(id: number, updateStockDto: UpdateStockDto): Promise<Stock> {
    const updatedStock = await this.stockRepository.update(id, updateStockDto);
    if (!updatedStock) {
      throw new NotFoundException(`Stock record with ID ${id} not found`);
    }
    return updatedStock;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.stockRepository.remove(id);
  }

  async adjustStock(stockAdjustmentDto: StockAdjustmentDto): Promise<Stock> {
    const { productId, newQuantity, reason, notes } = stockAdjustmentDto;

    // Find the main stock record for the product
    const stocks = await this.stockRepository.findByProduct(productId);
    if (stocks.length === 0) {
      throw new NotFoundException(`No stock records found for product ID ${productId}`);
    }

    // For simplicity, adjust the first stock record
    const stockToAdjust = stocks[0];
    const currentQuantity = stockToAdjust.quantity;
    const quantityDifference = newQuantity - currentQuantity;

    if (quantityDifference === 0) {
      throw new BadRequestException('New quantity is the same as current quantity');
    }

    // Update stock quantity
    const updatedStock = await this.stockRepository.adjustQuantity(stockToAdjust.id, newQuantity);
    if (!updatedStock) {
      throw new NotFoundException(`Stock record with ID ${stockToAdjust.id} not found`);
    }

    // Create stock movement record
    const movementDto: CreateStockMovementDto = {
      productId,
      type: quantityDifference > 0 ? MovementType.IN : MovementType.OUT,
      reason: MovementReason.INVENTORY_ADJUSTMENT,
      quantity: Math.abs(quantityDifference),
      notes: notes || reason || 'Stock adjustment',
    };

    await this.stockMovementRepository.create(movementDto);

    return updatedStock;
  }

  async getTotalStockByProduct(productId: number): Promise<number> {
    return this.stockRepository.getTotalQuantityByProduct(productId);
  }

  async recordStockMovement(createStockMovementDto: CreateStockMovementDto): Promise<void> {
    // Verify product exists
    const productExists = await this.productRepository.exists(createStockMovementDto.productId);
    if (!productExists) {
      throw new NotFoundException(`Product with ID ${createStockMovementDto.productId} not found`);
    }

    await this.stockMovementRepository.create(createStockMovementDto);
  }
}
