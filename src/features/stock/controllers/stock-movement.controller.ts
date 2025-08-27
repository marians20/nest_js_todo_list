import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { StockMovementService } from '../services/stock-movement.service';
import { CreateStockMovementDto } from '../dto/stock-movement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/stock-movements')
@UseGuards(JwtAuthGuard)
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Post()
  create(@Body() createStockMovementDto: CreateStockMovementDto) {
    return this.stockMovementService.create(createStockMovementDto);
  }

  @Get()
  findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    if (startDate && endDate) {
      return this.stockMovementService.findByDateRange(new Date(startDate), new Date(endDate));
    }
    return this.stockMovementService.findAll();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.stockMovementService.findByProduct(productId);
  }

  @Get('product/:productId/summary')
  getMovementSummary(@Param('productId', ParseIntPipe) productId: number) {
    return this.stockMovementService.getMovementSummary(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementService.findOne(id);
  }
}
