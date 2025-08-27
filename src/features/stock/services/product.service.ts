import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { StockRepository } from '../repositories/stock.repository';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly stockRepository: StockRepository,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productRepository.findBySku(createProductDto.sku);
    if (existingProduct) {
      throw new ConflictException(`Product with SKU '${createProductDto.sku}' already exists`);
    }

    return this.productRepository.create(createProductDto);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productRepository.findBySku(sku);
    if (!product) {
      throw new NotFoundException(`Product with SKU '${sku}' not found`);
    }
    return product;
  }

  async findLowStock(): Promise<Product[]> {
    return this.productRepository.findLowStock();
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    // Check if product exists
    await this.findOne(id);
    
    // If updating SKU, check for conflicts
    if (updateProductDto.sku) {
      const existingProduct = await this.productRepository.findBySku(updateProductDto.sku);
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException(`Product with SKU '${updateProductDto.sku}' already exists`);
      }
    }

    const updatedProduct = await this.productRepository.update(id, updateProductDto);
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    // Check if product exists
    await this.findOne(id);
    
    // Check if product has stock
    const stocks = await this.stockRepository.findByProduct(id);
    if (stocks.length > 0) {
      throw new ConflictException('Cannot delete product with existing stock records');
    }

    await this.productRepository.remove(id);
  }

  async getProductWithStockInfo(id: number): Promise<Product & { totalStock: number }> {
    const product = await this.findOne(id);
    const totalStock = await this.stockRepository.getTotalQuantityByProduct(id);
    
    return {
      ...product,
      totalStock,
    };
  }
}
