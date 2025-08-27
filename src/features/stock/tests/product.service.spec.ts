import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../services/product.service';
import { ProductRepository } from '../repositories/product.repository';
import { StockRepository } from '../repositories/stock.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductDto } from '../dto/product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: jest.Mocked<ProductRepository>;
  let stockRepository: jest.Mocked<StockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findBySku: jest.fn(),
            findLowStock: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            exists: jest.fn(),
          },
        },
        {
          provide: StockRepository,
          useValue: {
            findByProduct: jest.fn(),
            getTotalQuantityByProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(ProductRepository);
    stockRepository = module.get(StockRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'TEST001',
        name: 'Test Product',
        description: 'Test Description',
        category: 'Test Category',
        unitPrice: 10.99,
        minStockLevel: 5,
      };

      const expectedProduct = { id: 1, ...createProductDto, isActive: true };

      productRepository.findBySku.mockResolvedValue(null);
      productRepository.create.mockResolvedValue(expectedProduct as any);

      const result = await service.create(createProductDto);

      expect(productRepository.findBySku).toHaveBeenCalledWith('TEST001');
      expect(productRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(expectedProduct);
    });

    it('should throw ConflictException when SKU already exists', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'TEST001',
        name: 'Test Product',
      };

      const existingProduct = { id: 1, sku: 'TEST001', name: 'Existing Product' };
      productRepository.findBySku.mockResolvedValue(existingProduct as any);

      await expect(service.create(createProductDto)).rejects.toThrow(ConflictException);
      expect(productRepository.findBySku).toHaveBeenCalledWith('TEST001');
      expect(productRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      const expectedProduct = { id: 1, sku: 'TEST001', name: 'Test Product' };
      productRepository.findOne.mockResolvedValue(expectedProduct as any);

      const result = await service.findOne(1);

      expect(productRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getProductWithStockInfo', () => {
    it('should return product with total stock', async () => {
      const product = { id: 1, sku: 'TEST001', name: 'Test Product' };
      const totalStock = 50;

      productRepository.findOne.mockResolvedValue(product as any);
      stockRepository.getTotalQuantityByProduct.mockResolvedValue(totalStock);

      const result = await service.getProductWithStockInfo(1);

      expect(result).toEqual({ ...product, totalStock });
      expect(productRepository.findOne).toHaveBeenCalledWith(1);
      expect(stockRepository.getTotalQuantityByProduct).toHaveBeenCalledWith(1);
    });
  });
});
