import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum MovementReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  EXPIRED = 'EXPIRED',
  INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, product => product.stockMovements)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'text',
  })
  type: MovementType;

  @Column({
    type: 'text',
  })
  reason: MovementReason;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;
}
