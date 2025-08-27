import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

describe('ProductRepository', () => {
  let productRepository: ProductRepository;
  let mockRepository: jest.Mocked<Repository<Product>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    productRepository = module.get<ProductRepository>(ProductRepository);
    mockRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(productRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'TEST001',
        name: 'Test Product',
        category: 'Test',
        unitPrice: 10.99,
      };

      const mockProduct = { id: 1, ...createProductDto } as Product;

      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await productRepository.create(createProductDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products with stock relations', async () => {
      const mockProducts = [
        { id: 1, sku: 'TEST001', name: 'Product 1' },
        { id: 2, sku: 'TEST002', name: 'Product 2' },
      ] as Product[];

      mockRepository.find.mockResolvedValue(mockProducts);

      const result = await productRepository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['stocks'],
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a product with relations when found', async () => {
      const mockProduct = { id: 1, sku: 'TEST001', name: 'Test Product' } as Product;

      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await productRepository.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['stocks', 'stockMovements'],
      });
      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await productRepository.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findBySku', () => {
    it('should return a product by SKU', async () => {
      const mockProduct = { id: 1, sku: 'TEST001', name: 'Test Product' } as Product;

      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await productRepository.findBySku('TEST001');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { sku: 'TEST001' },
        relations: ['stocks'],
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findLowStock', () => {
    it('should return products with low stock', async () => {
      const mockProducts = [
        { id: 1, sku: 'TEST001', name: 'Low Stock Product' },
      ] as Product[];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await productRepository.findLowStock();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('product.stocks', 'stock');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('stock.quantity <= product.minStockLevel');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.isActive = :isActive', { isActive: true });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('update', () => {
    it('should update a product and return the updated product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product Name',
        unitPrice: 15.99,
      };

      const updatedProduct = { id: 1, sku: 'TEST001', ...updateProductDto } as Product;

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(updatedProduct);

      const result = await productRepository.update(1, updateProductDto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateProductDto);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await productRepository.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('exists', () => {
    it('should return true when product exists', async () => {
      mockRepository.count.mockResolvedValue(1);

      const result = await productRepository.exists(1);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe(true);
    });

    it('should return false when product does not exist', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await productRepository.exists(999);

      expect(result).toBe(false);
    });
  });
});
