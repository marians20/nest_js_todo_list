import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findBySku: jest.fn(),
            findLowStock: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getProductWithStockInfo: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        sku: 'TEST001',
        name: 'Test Product',
        category: 'Test',
        unitPrice: 10.99,
        minStockLevel: 5,
      };

      const expectedProduct = { id: 1, ...createProductDto };
      productService.create.mockResolvedValue(expectedProduct as any);

      const result = await controller.create(createProductDto);

      expect(productService.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [
        { id: 1, sku: 'TEST001', name: 'Test Product 1' },
        { id: 2, sku: 'TEST002', name: 'Test Product 2' },
      ];
      productService.findAll.mockResolvedValue(products as any);

      const result = await controller.findAll();

      expect(productService.findAll).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: 1, sku: 'TEST001', name: 'Test Product' };
      productService.findOne.mockResolvedValue(product as any);

      const result = await controller.findOne(1);

      expect(productService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });
  });

  describe('findBySku', () => {
    it('should return a product by SKU', async () => {
      const product = { id: 1, sku: 'TEST001', name: 'Test Product' };
      productService.findBySku.mockResolvedValue(product as any);

      const result = await controller.findBySku('TEST001');

      expect(productService.findBySku).toHaveBeenCalledWith('TEST001');
      expect(result).toEqual(product);
    });
  });

  describe('findLowStock', () => {
    it('should return products with low stock', async () => {
      const lowStockProducts = [
        { id: 1, sku: 'TEST001', name: 'Test Product', minStockLevel: 10 },
      ];
      productService.findLowStock.mockResolvedValue(lowStockProducts as any);

      const result = await controller.findLowStock();

      expect(productService.findLowStock).toHaveBeenCalled();
      expect(result).toEqual(lowStockProducts);
    });
  });

  describe('getProductWithStockInfo', () => {
    it('should return product with stock information', async () => {
      const productWithStock = {
        id: 1,
        sku: 'TEST001',
        name: 'Test Product',
        totalStock: 50,
      };
      productService.getProductWithStockInfo.mockResolvedValue(productWithStock as any);

      const result = await controller.getProductWithStockInfo(1);

      expect(productService.getProductWithStockInfo).toHaveBeenCalledWith(1);
      expect(result).toEqual(productWithStock);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product Name',
        unitPrice: 15.99,
      };

      const updatedProduct = { id: 1, sku: 'TEST001', ...updateProductDto };
      productService.update.mockResolvedValue(updatedProduct as any);

      const result = await controller.update(1, updateProductDto);

      expect(productService.update).toHaveBeenCalledWith(1, updateProductDto);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      productService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(productService.remove).toHaveBeenCalledWith(1);
    });
  });
});
