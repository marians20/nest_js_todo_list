import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto, UpdateStockDto } from '../dto/stock.dto';

@Injectable()
export class StockRepository {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const stock = this.stockRepository.create(createStockDto);
    return this.stockRepository.save(stock);
  }

  async findAll(): Promise<Stock[]> {
    return this.stockRepository.find({
      relations: ['product'],
    });
  }

  async findOne(id: number): Promise<Stock | null> {
    return this.stockRepository.findOne({
      where: { id } as FindOptionsWhere<Stock>,
      relations: ['product'],
    });
  }

  async findByProduct(productId: number): Promise<Stock[]> {
    return this.stockRepository.find({
      where: { productId } as FindOptionsWhere<Stock>,
      relations: ['product'],
    });
  }

  async findByLocation(location: string): Promise<Stock[]> {
    return this.stockRepository.find({
      where: { location } as FindOptionsWhere<Stock>,
      relations: ['product'],
    });
  }

  async getTotalQuantityByProduct(productId: number): Promise<number> {
    const result = await this.stockRepository
      .createQueryBuilder('stock')
      .select('SUM(stock.quantity)', 'total')
      .where('stock.productId = :productId', { productId })
      .getRawOne<{ total: string }>();
    
    return parseInt(result?.total || '0') || 0;
  }

  async update(id: number, updateStockDto: UpdateStockDto): Promise<Stock | null> {
    await this.stockRepository.update(id, updateStockDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.stockRepository.delete(id);
  }

  async adjustQuantity(id: number, newQuantity: number): Promise<Stock | null> {
    await this.stockRepository.update(id, { quantity: newQuantity });
    return this.findOne(id);
  }
}
