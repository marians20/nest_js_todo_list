# Stock Control System

A comprehensive stock management feature for tracking products, inventory levels, and stock movements.

## Features

### Product Management
- Create, read, update, and delete products
- Unique SKU validation
- Product categorization
- Price management
- Minimum stock level alerts
- Active/inactive product status

### Stock Management
- Track stock quantities per product
- Support for multiple locations
- Batch number tracking
- Expiry date management
- Stock adjustments with audit trail

### Stock Movement Tracking
- Record all stock in/out movements
- Movement types: IN, OUT, ADJUSTMENT
- Movement reasons: PURCHASE, SALE, RETURN, DAMAGE, EXPIRED, INVENTORY_ADJUSTMENT, TRANSFER
- Complete audit trail with timestamps
- Movement summaries and reports

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/stock-info` - Get product with stock information
- `GET /api/products/sku/:sku` - Get product by SKU
- `GET /api/products/low-stock` - Get products with low stock
- `POST /api/products` - Create new product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Stock
- `GET /api/stock` - List all stock records
- `GET /api/stock/:id` - Get stock record by ID
- `GET /api/stock/product/:productId` - Get stock by product
- `GET /api/stock/location/:location` - Get stock by location
- `GET /api/stock/total/:productId` - Get total stock for product
- `POST /api/stock` - Create stock record
- `POST /api/stock/adjust` - Adjust stock levels
- `PATCH /api/stock/:id` - Update stock record
- `DELETE /api/stock/:id` - Delete stock record

### Stock Movements
- `GET /api/stock-movements` - List all movements (with optional date filters)
- `GET /api/stock-movements/:id` - Get movement by ID
- `GET /api/stock-movements/product/:productId` - Get movements by product
- `GET /api/stock-movements/product/:productId/summary` - Get movement summary
- `POST /api/stock-movements` - Record new movement

## Data Models

### Product
```typescript
{
  id: number;
  sku: string;           // Unique identifier
  name: string;
  description?: string;
  category?: string;
  unitPrice?: number;
  minStockLevel: number; // Minimum stock alert threshold
  isActive: boolean;     // Product status
  createdAt: Date;
  updatedAt: Date;
}
```

### Stock
```typescript
{
  id: number;
  productId: number;
  quantity: number;
  location?: string;     // Storage location
  batchNumber?: string;  // Batch/lot number
  expiryDate?: Date;     // Product expiry date
  createdAt: Date;
  updatedAt: Date;
}
```

### Stock Movement
```typescript
{
  id: number;
  productId: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  reason: 'PURCHASE' | 'SALE' | 'RETURN' | 'DAMAGE' | 'EXPIRED' | 'INVENTORY_ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  unitCost?: number;     // Cost per unit for the movement
  reference?: string;    // Reference document (PO, invoice, etc.)
  notes?: string;        // Additional notes
  location?: string;     // Movement location
  createdAt: Date;
}
```

## Usage Examples

### Creating a Product
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "sku": "WIDGET001",
  "name": "Blue Widget",
  "description": "High-quality blue widget",
  "category": "Widgets",
  "unitPrice": 19.99,
  "minStockLevel": 10
}
```

### Adding Initial Stock
```http
POST /api/stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": 1,
  "quantity": 100,
  "location": "Warehouse A",
  "batchNumber": "BATCH001"
}
```

### Recording a Sale
```http
POST /api/stock-movements
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": 1,
  "type": "OUT",
  "reason": "SALE",
  "quantity": 5,
  "reference": "INV-2024-001",
  "notes": "Sold to customer XYZ"
}
```

### Stock Adjustment
```http
POST /api/stock/adjust
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": 1,
  "newQuantity": 95,
  "reason": "Damaged goods found",
  "notes": "5 units damaged during quality check"
}
```

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., duplicate SKU)
- `500` - Internal Server Error

Error responses include detailed error messages:
```json
{
  "statusCode": 409,
  "message": "Product with SKU 'WIDGET001' already exists",
  "error": "Conflict"
}
```
