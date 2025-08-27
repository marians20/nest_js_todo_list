import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementController } from '../controllers/stock-movement.controller';
import { StockMovementService } from '../services/stock-movement.service';
import { CreateStockMovementDto } from '../dto/stock-movement.dto';
import { MovementType, MovementReason } from '../entities/stock-movement.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('StockMovementController', () => {
  let controller: StockMovementController;
  let stockMovementService: jest.Mocked<StockMovementService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementController],
      providers: [
        {
          provide: StockMovementService,
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<StockMovementController>(StockMovementController);
    stockMovementService = module.get(StockMovementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create stock movement', async () => {
      const createMovementDto: CreateStockMovementDto = {
        productId: 1,
        type: MovementType.IN,
        reason: MovementReason.PURCHASE,
        quantity: 50,
        unitCost: 15.5,
      };

      const expectedMovement = { id: 1, ...createMovementDto };
      stockMovementService.create.mockResolvedValue(expectedMovement as any);

      const result = await controller.create(createMovementDto);

      expect(stockMovementService.create).toHaveBeenCalledWith(createMovementDto);
      expect(result).toEqual(expectedMovement);
    });
  });

  describe('findAll', () => {
    it('should return all movements when no date filters provided', async () => {
      const movements = [
        { id: 1, productId: 1, type: MovementType.IN },
        { id: 2, productId: 1, type: MovementType.OUT },
      ];
      stockMovementService.findAll.mockResolvedValue(movements as any);

      const result = await controller.findAll();

      expect(stockMovementService.findAll).toHaveBeenCalled();
      expect(result).toEqual(movements);
    });

    it('should return movements filtered by date range', async () => {
      const movements = [{ id: 1, productId: 1, type: MovementType.IN }];
      stockMovementService.findByDateRange.mockResolvedValue(movements as any);

      const result = await controller.findAll('2024-01-01', '2024-01-31');

      expect(stockMovementService.findByDateRange).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      expect(result).toEqual(movements);
    });
  });

  describe('findByProduct', () => {
    it('should return movements for a product', async () => {
      const movements = [
        { id: 1, productId: 1, type: MovementType.IN },
        { id: 2, productId: 1, type: MovementType.OUT },
      ];
      stockMovementService.findByProduct.mockResolvedValue(movements as any);

      const result = await controller.findByProduct(1);

      expect(stockMovementService.findByProduct).toHaveBeenCalledWith(1);
      expect(result).toEqual(movements);
    });
  });

  describe('getMovementSummary', () => {
    it('should return movement summary for a product', async () => {
      const summary = { totalIn: 100, totalOut: 25 };
      stockMovementService.getMovementSummary.mockResolvedValue(summary);

      const result = await controller.getMovementSummary(1);

      expect(stockMovementService.getMovementSummary).toHaveBeenCalledWith(1);
      expect(result).toEqual(summary);
    });
  });

  describe('findOne', () => {
    it('should return a movement by id', async () => {
      const movement = { id: 1, productId: 1, type: MovementType.IN };
      stockMovementService.findOne.mockResolvedValue(movement as any);

      const result = await controller.findOne(1);

      expect(stockMovementService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(movement);
    });
  });
});
