import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from '../services/stock.service';
import { StockRepository } from '../repositories/stock.repository';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { ProductRepository } from '../repositories/product.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStockDto } from '../dto/stock.dto';
import { StockAdjustmentDto, CreateStockMovementDto } from '../dto/stock-movement.dto';
import { MovementType, MovementReason } from '../entities/stock-movement.entity';

describe('StockService', () => {
  let service: StockService;
  let stockRepository: jest.Mocked<StockRepository>;
  let stockMovementRepository: jest.Mocked<StockMovementRepository>;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: StockRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByProduct: jest.fn(),
            findByLocation: jest.fn(),
            getTotalQuantityByProduct: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            adjustQuantity: jest.fn(),
          },
        },
        {
          provide: StockMovementRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    stockRepository = module.get(StockRepository);
    stockMovementRepository = module.get(StockMovementRepository);
    productRepository = module.get(ProductRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create stock successfully', async () => {
      const createStockDto: CreateStockDto = {
        productId: 1,
        quantity: 100,
        location: 'Warehouse A',
        batchNumber: 'BATCH001',
      };

      const expectedStock = { id: 1, ...createStockDto };

      productRepository.exists.mockResolvedValue(true);
      stockRepository.create.mockResolvedValue(expectedStock as any);

      const result = await service.create(createStockDto);

      expect(productRepository.exists).toHaveBeenCalledWith(1);
      expect(stockRepository.create).toHaveBeenCalledWith(createStockDto);
      expect(result).toEqual(expectedStock);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const createStockDto: CreateStockDto = {
        productId: 999,
        quantity: 100,
      };

      productRepository.exists.mockResolvedValue(false);

      await expect(service.create(createStockDto)).rejects.toThrow(NotFoundException);
      expect(productRepository.exists).toHaveBeenCalledWith(999);
      expect(stockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return stock when found', async () => {
      const expectedStock = { id: 1, productId: 1, quantity: 100 };
      stockRepository.findOne.mockResolvedValue(expectedStock as any);

      const result = await service.findOne(1);

      expect(stockRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedStock);
    });

    it('should throw NotFoundException when stock not found', async () => {
      stockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(stockRepository.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('adjustStock', () => {
    it('should adjust stock quantity successfully', async () => {
      const adjustmentDto: StockAdjustmentDto = {
        productId: 1,
        newQuantity: 120,
        reason: 'Inventory correction',
        notes: 'Physical count adjustment',
      };

      const existingStock = { id: 1, productId: 1, quantity: 100 };
      const updatedStock = { ...existingStock, quantity: 120 };

      stockRepository.findByProduct.mockResolvedValue([existingStock as any]);
      stockRepository.adjustQuantity.mockResolvedValue(updatedStock as any);
      stockMovementRepository.create.mockResolvedValue({} as any);

      const result = await service.adjustStock(adjustmentDto);

      expect(stockRepository.findByProduct).toHaveBeenCalledWith(1);
      expect(stockRepository.adjustQuantity).toHaveBeenCalledWith(1, 120);
      expect(stockMovementRepository.create).toHaveBeenCalledWith({
        productId: 1,
        type: MovementType.IN,
        reason: MovementReason.INVENTORY_ADJUSTMENT,
        quantity: 20,
        notes: 'Physical count adjustment',
      });
      expect(result).toEqual(updatedStock);
    });

    it('should handle stock decrease adjustment', async () => {
      const adjustmentDto: StockAdjustmentDto = {
        productId: 1,
        newQuantity: 80,
        reason: 'Damaged goods',
      };

      const existingStock = { id: 1, productId: 1, quantity: 100 };
      const updatedStock = { ...existingStock, quantity: 80 };

      stockRepository.findByProduct.mockResolvedValue([existingStock as any]);
      stockRepository.adjustQuantity.mockResolvedValue(updatedStock as any);
      stockMovementRepository.create.mockResolvedValue({} as any);

      const result = await service.adjustStock(adjustmentDto);

      expect(stockMovementRepository.create).toHaveBeenCalledWith({
        productId: 1,
        type: MovementType.OUT,
        reason: MovementReason.INVENTORY_ADJUSTMENT,
        quantity: 20,
        notes: 'Damaged goods',
      });
      expect(result).toEqual(updatedStock);
    });

    it('should throw NotFoundException when no stock records found', async () => {
      const adjustmentDto: StockAdjustmentDto = {
        productId: 1,
        newQuantity: 120,
      };

      stockRepository.findByProduct.mockResolvedValue([]);

      await expect(service.adjustStock(adjustmentDto)).rejects.toThrow(NotFoundException);
      expect(stockRepository.findByProduct).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when new quantity equals current quantity', async () => {
      const adjustmentDto: StockAdjustmentDto = {
        productId: 1,
        newQuantity: 100,
      };

      const existingStock = { id: 1, productId: 1, quantity: 100 };
      stockRepository.findByProduct.mockResolvedValue([existingStock as any]);

      await expect(service.adjustStock(adjustmentDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('recordStockMovement', () => {
    it('should record stock movement successfully', async () => {
      const movementDto: CreateStockMovementDto = {
        productId: 1,
        type: MovementType.IN,
        reason: MovementReason.PURCHASE,
        quantity: 50,
        unitCost: 15.00,
        reference: 'PO-001',
      };

      productRepository.exists.mockResolvedValue(true);
      stockMovementRepository.create.mockResolvedValue({} as any);

      await service.recordStockMovement(movementDto);

      expect(productRepository.exists).toHaveBeenCalledWith(1);
      expect(stockMovementRepository.create).toHaveBeenCalledWith(movementDto);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const movementDto: CreateStockMovementDto = {
        productId: 999,
        type: MovementType.IN,
        reason: MovementReason.PURCHASE,
        quantity: 50,
      };

      productRepository.exists.mockResolvedValue(false);

      await expect(service.recordStockMovement(movementDto)).rejects.toThrow(NotFoundException);
      expect(productRepository.exists).toHaveBeenCalledWith(999);
      expect(stockMovementRepository.create).not.toHaveBeenCalled();
    });
  });
});
