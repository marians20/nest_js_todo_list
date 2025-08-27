import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from '../controllers/stock.controller';
import { StockService } from '../services/stock.service';
import { CreateStockDto, UpdateStockDto } from '../dto/stock.dto';
import { StockAdjustmentDto } from '../dto/stock-movement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('StockController', () => {
  let controller: StockController;
  let stockService: jest.Mocked<StockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByProduct: jest.fn(),
            findByLocation: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            adjustStock: jest.fn(),
            getTotalStockByProduct: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<StockController>(StockController);
    stockService = module.get(StockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create stock record', async () => {
      const createStockDto: CreateStockDto = {
        productId: 1,
        quantity: 100,
        location: 'Warehouse A',
      };

      const expectedStock = { id: 1, ...createStockDto };
      stockService.create.mockResolvedValue(expectedStock as any);

      const result = await controller.create(createStockDto);

      expect(stockService.create).toHaveBeenCalledWith(createStockDto);
      expect(result).toEqual(expectedStock);
    });
  });

  describe('findAll', () => {
    it('should return all stock records', async () => {
      const stockRecords = [
        { id: 1, productId: 1, quantity: 100 },
        { id: 2, productId: 2, quantity: 50 },
      ];
      stockService.findAll.mockResolvedValue(stockRecords as any);

      const result = await controller.findAll();

      expect(stockService.findAll).toHaveBeenCalled();
      expect(result).toEqual(stockRecords);
    });
  });

  describe('findByProduct', () => {
    it('should return stock records for a product', async () => {
      const stockRecords = [{ id: 1, productId: 1, quantity: 100 }];
      stockService.findByProduct.mockResolvedValue(stockRecords as any);

      const result = await controller.findByProduct(1);

      expect(stockService.findByProduct).toHaveBeenCalledWith(1);
      expect(result).toEqual(stockRecords);
    });
  });

  describe('findByLocation', () => {
    it('should return stock records for a location', async () => {
      const stockRecords = [{ id: 1, productId: 1, location: 'Warehouse A' }];
      stockService.findByLocation.mockResolvedValue(stockRecords as any);

      const result = await controller.findByLocation('Warehouse A');

      expect(stockService.findByLocation).toHaveBeenCalledWith('Warehouse A');
      expect(result).toEqual(stockRecords);
    });
  });

  describe('getTotalStockByProduct', () => {
    it('should return total stock for a product', async () => {
      stockService.getTotalStockByProduct.mockResolvedValue(150);

      const result = await controller.getTotalStockByProduct(1);

      expect(stockService.getTotalStockByProduct).toHaveBeenCalledWith(1);
      expect(result).toBe(150);
    });
  });

  describe('findOne', () => {
    it('should return a stock record by id', async () => {
      const stockRecord = { id: 1, productId: 1, quantity: 100 };
      stockService.findOne.mockResolvedValue(stockRecord as any);

      const result = await controller.findOne(1);

      expect(stockService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(stockRecord);
    });
  });

  describe('update', () => {
    it('should update a stock record', async () => {
      const updateStockDto: UpdateStockDto = {
        quantity: 120,
        location: 'Warehouse B',
      };

      const updatedStock = { id: 1, productId: 1, ...updateStockDto };
      stockService.update.mockResolvedValue(updatedStock as any);

      const result = await controller.update(1, updateStockDto);

      expect(stockService.update).toHaveBeenCalledWith(1, updateStockDto);
      expect(result).toEqual(updatedStock);
    });
  });

  describe('adjustStock', () => {
    it('should adjust stock quantity', async () => {
      const adjustmentDto: StockAdjustmentDto = {
        productId: 1,
        newQuantity: 150,
        reason: 'Inventory correction',
      };

      const adjustedStock = { id: 1, productId: 1, quantity: 150 };
      stockService.adjustStock.mockResolvedValue(adjustedStock as any);

      const result = await controller.adjustStock(adjustmentDto);

      expect(stockService.adjustStock).toHaveBeenCalledWith(adjustmentDto);
      expect(result).toEqual(adjustedStock);
    });
  });

  describe('remove', () => {
    it('should remove a stock record', async () => {
      stockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(stockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
