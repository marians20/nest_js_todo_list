import { IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { MovementType, MovementReason } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @IsNumber()
  productId: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsEnum(MovementReason)
  reason: MovementReason;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class StockAdjustmentDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  newQuantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
