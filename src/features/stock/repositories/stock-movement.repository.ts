import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { StockMovement } from '../entities/stock-movement.entity';
import { CreateStockMovementDto } from '../dto/stock-movement.dto';

@Injectable()
export class StockMovementRepository {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {}

  async create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    const movement = this.stockMovementRepository.create(createStockMovementDto);
    return this.stockMovementRepository.save(movement);
  }

  async findAll(): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<StockMovement | null> {
    return this.stockMovementRepository.findOne({
      where: { id } as FindOptionsWhere<StockMovement>,
      relations: ['product'],
    });
  }

  async findByProduct(productId: number): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: { productId } as FindOptionsWhere<StockMovement>,
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    return this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .where('movement.createdAt >= :startDate', { startDate })
      .andWhere('movement.createdAt <= :endDate', { endDate })
      .orderBy('movement.createdAt', 'DESC')
      .getMany();
  }

  async getMovementSummary(productId: number): Promise<{ totalIn: number; totalOut: number }> {
    const inResult = await this.stockMovementRepository
      .createQueryBuilder('movement')
      .select('SUM(movement.quantity)', 'total')
      .where('movement.productId = :productId', { productId })
      .andWhere('movement.type = :type', { type: 'IN' })
      .getRawOne<{ total: string }>();

    const outResult = await this.stockMovementRepository
      .createQueryBuilder('movement')
      .select('SUM(movement.quantity)', 'total')
      .where('movement.productId = :productId', { productId })
      .andWhere('movement.type = :type', { type: 'OUT' })
      .getRawOne<{ total: string }>();

    return {
      totalIn: parseInt(inResult?.total || '0') || 0,
      totalOut: parseInt(outResult?.total || '0') || 0,
    };
  }
}
