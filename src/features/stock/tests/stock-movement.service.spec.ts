import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementService } from '../services/stock-movement.service';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateStockMovementDto } from '../dto/stock-movement.dto';
import { MovementType, MovementReason } from '../entities/stock-movement.entity';

describe('StockMovementService', () => {
  let service: StockMovementService;
  let stockMovementRepository: jest.Mocked<StockMovementRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementService,
        {
          provide: StockMovementRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByProduct: jest.fn(),
            findByDateRange: jest.fn(),
            getMovementSummary: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockMovementService>(StockMovementService);
    stockMovementRepository = module.get(StockMovementRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create stock movement successfully', async () => {
      const createMovementDto: CreateStockMovementDto = {
        productId: 1,
        type: MovementType.IN,
        reason: MovementReason.PURCHASE,
        quantity: 50,
        unitCost: 15.5,
        reference: 'PO-001',
      };

      const expectedMovement = { id: 1, ...createMovementDto };
      stockMovementRepository.create.mockResolvedValue(expectedMovement as any);

      const result = await service.create(createMovementDto);

      expect(stockMovementRepository.create).toHaveBeenCalledWith(createMovementDto);
      expect(result).toEqual(expectedMovement);
    });
  });

  describe('findOne', () => {
    it('should return movement when found', async () => {
      const expectedMovement = { id: 1, productId: 1, type: MovementType.IN };
      stockMovementRepository.findOne.mockResolvedValue(expectedMovement as any);

      const result = await service.findOne(1);

      expect(stockMovementRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedMovement);
    });

    it('should throw NotFoundException when movement not found', async () => {
      stockMovementRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(stockMovementRepository.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByProduct', () => {
    it('should return movements for product', async () => {
      const movements = [
        { id: 1, productId: 1, type: MovementType.IN },
        { id: 2, productId: 1, type: MovementType.OUT },
      ];
      stockMovementRepository.findByProduct.mockResolvedValue(movements as any);

      const result = await service.findByProduct(1);

      expect(stockMovementRepository.findByProduct).toHaveBeenCalledWith(1);
      expect(result).toEqual(movements);
    });
  });

  describe('findByDateRange', () => {
    it('should return movements within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const movements = [{ id: 1, productId: 1, type: MovementType.IN }];
      
      stockMovementRepository.findByDateRange.mockResolvedValue(movements as any);

      const result = await service.findByDateRange(startDate, endDate);

      expect(stockMovementRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(movements);
    });
  });

  describe('getMovementSummary', () => {
    it('should return movement summary for product', async () => {
      const summary = { totalIn: 100, totalOut: 25 };
      stockMovementRepository.getMovementSummary.mockResolvedValue(summary);

      const result = await service.getMovementSummary(1);

      expect(stockMovementRepository.getMovementSummary).toHaveBeenCalledWith(1);
      expect(result).toEqual(summary);
    });
  });
});
