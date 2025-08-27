import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { CreateStockDto, UpdateStockDto } from '../dto/stock.dto';
import { StockAdjustmentDto } from '../dto/stock-movement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.stockService.findByProduct(productId);
  }

  @Get('location/:location')
  findByLocation(@Param('location') location: string) {
    return this.stockService.findByLocation(location);
  }

  @Get('total/:productId')
  getTotalStockByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.stockService.getTotalStockByProduct(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(id, updateStockDto);
  }

  @Post('adjust')
  adjustStock(@Body() stockAdjustmentDto: StockAdjustmentDto) {
    return this.stockService.adjustStock(stockAdjustmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.remove(id);
  }
}
