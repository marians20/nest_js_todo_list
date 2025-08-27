import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { StockMovement } from '../entities/stock-movement.entity';
import { MovementType, MovementReason } from '../entities/stock-movement.entity';
import { CreateStockMovementDto } from '../dto/stock-movement.dto';

describe('StockMovementRepository', () => {
  let repository: StockMovementRepository;
  let typeormRepository: jest.Mocked<Repository<StockMovement>>;

  const mockStockMovement = {
    id: 1,
    productId: 1,
    product: null as any,
    type: MovementType.IN,
    quantity: 10,
    reason: MovementReason.PURCHASE,
    reference: 'REF001',
    unitCost: 10.50,
    notes: 'Test notes',
    location: 'Warehouse A',
    createdAt: new Date(),
  } as StockMovement;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementRepository,
        {
          provide: getRepositoryToken(StockMovement),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<StockMovementRepository>(StockMovementRepository);
    typeormRepository = module.get(getRepositoryToken(StockMovement));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all stock movements ordered by date desc', async () => {
      const movements = [mockStockMovement];
      typeormRepository.find.mockResolvedValue(movements);

      const result = await repository.findAll();

      expect(result).toEqual(movements);
      expect(typeormRepository.find).toHaveBeenCalledWith({
        relations: ['product'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a stock movement by id', async () => {
      typeormRepository.findOne.mockResolvedValue(mockStockMovement);

      const result = await repository.findOne(1);

      expect(result).toEqual(mockStockMovement);
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['product'],
      });
    });

    it('should return null when movement not found', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['product'],
      });
    });
  });

  describe('findByProduct', () => {
    it('should return movements for a specific product', async () => {
      const movements = [mockStockMovement];
      typeormRepository.find.mockResolvedValue(movements);

      const result = await repository.findByProduct(1);

      expect(result).toEqual(movements);
      expect(typeormRepository.find).toHaveBeenCalledWith({
        where: { productId: 1 },
        relations: ['product'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByDateRange', () => {
    it('should return movements within date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      const movements = [mockStockMovement];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(movements),
      };

      typeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await repository.findByDateRange(startDate, endDate);

      expect(result).toEqual(movements);
      expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('movement');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('movement.product', 'product');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('movement.createdAt >= :startDate', { startDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('movement.createdAt <= :endDate', { endDate });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('movement.createdAt', 'DESC');
    });
  });

  describe('getMovementSummary', () => {
    it('should return movement summary for a product', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      // Mock two separate query builder calls for IN and OUT
      typeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      
      // First call for IN movements
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ total: '100' })
        .mockResolvedValueOnce({ total: '30' });

      const result = await repository.getMovementSummary(1);

      expect(result).toEqual({ totalIn: 100, totalOut: 30 });
      expect(typeormRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('movement');
    });

    it('should return zero values when no movements found', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      typeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      
      // Mock null responses
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await repository.getMovementSummary(999);

      expect(result).toEqual({ totalIn: 0, totalOut: 0 });
    });
  });

  describe('create', () => {
    it('should create and save a new stock movement', async () => {
      const createDto: CreateStockMovementDto = {
        productId: 1,
        type: MovementType.IN,
        quantity: 10,
        reason: MovementReason.PURCHASE,
        reference: 'REF001',
      };

      const newMovement = { ...mockStockMovement };
      typeormRepository.create.mockReturnValue(newMovement as any);
      typeormRepository.save.mockResolvedValue(newMovement);

      const result = await repository.create(createDto);

      expect(result).toEqual(newMovement);
      expect(typeormRepository.create).toHaveBeenCalledWith({
        ...createDto,
      });
      expect(typeormRepository.save).toHaveBeenCalledWith(newMovement);
    });
  });
});
