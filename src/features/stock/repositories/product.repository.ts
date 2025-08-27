import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['stocks'],
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id } as FindOptionsWhere<Product>,
      relations: ['stocks', 'stockMovements'],
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { sku } as FindOptionsWhere<Product>,
      relations: ['stocks'],
    });
  }

  async findLowStock(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.stocks', 'stock')
      .where('stock.quantity <= product.minStockLevel')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product | null> {
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.productRepository.count({
      where: { id } as FindOptionsWhere<Product>,
    });
    return count > 0;
  }
}
