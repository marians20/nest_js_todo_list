#!/bin/bash

# Stock Control System API Demo Script
# This script demonstrates the complete workflow of the stock control system

echo "🏭 Stock Control System API Demo"
echo "================================="

# Base URL for the API
BASE_URL="http://localhost:3000"

# First, register a user and get a JWT token
echo "📝 Step 1: Registering a user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "stockmanager",
    "email": "manager@stockdemo.com",
    "password": "password123"
  }')

echo "Registration response: $REGISTER_RESPONSE"

# Login to get JWT token
echo "🔐 Step 2: Logging in to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "stockmanager",
    "password": "password123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract JWT token (requires jq for JSON parsing)
# If jq is not available, manually copy the token from the login response
if command -v jq &> /dev/null; then
  JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
  echo "JWT Token extracted: ${JWT_TOKEN:0:50}..."
else
  echo "⚠️  Please install 'jq' to automatically extract JWT token"
  echo "Or manually copy the access_token from the login response above"
  echo "Then run the following commands with: -H \"Authorization: Bearer YOUR_TOKEN\""
  exit 1
fi

# Create some products
echo "📦 Step 3: Creating products..."

# Product 1: Blue Widget
echo "Creating Blue Widget..."
PRODUCT1=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "sku": "WIDGET001",
    "name": "Blue Widget",
    "description": "High-quality blue widget for industrial use",
    "category": "Widgets",
    "unitPrice": 19.99,
    "minStockLevel": 10
  }')

echo "Product 1 created: $PRODUCT1"

# Product 2: Red Gadget
echo "Creating Red Gadget..."
PRODUCT2=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "sku": "GADGET002",
    "name": "Red Gadget",
    "description": "Premium red gadget with advanced features",
    "category": "Gadgets",
    "unitPrice": 35.50,
    "minStockLevel": 5
  }')

echo "Product 2 created: $PRODUCT2"

# List all products
echo "📋 Step 4: Listing all products..."
curl -s -X GET "$BASE_URL/api/products" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# Add initial stock for products
echo "📥 Step 5: Adding initial stock..."

# Add stock for Blue Widget
echo "Adding stock for Blue Widget..."
curl -s -X POST "$BASE_URL/api/stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "productId": 1,
    "quantity": 100,
    "location": "Warehouse A",
    "batchNumber": "BATCH001"
  }' | jq '.'

# Add stock for Red Gadget
echo "Adding stock for Red Gadget..."
curl -s -X POST "$BASE_URL/api/stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "productId": 2,
    "quantity": 50,
    "location": "Warehouse B",
    "batchNumber": "BATCH002"
  }' | jq '.'

# Record some stock movements
echo "📊 Step 6: Recording stock movements..."

# Record a purchase (stock IN)
echo "Recording a purchase..."
curl -s -X POST "$BASE_URL/api/stock-movements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "productId": 1,
    "type": "IN",
    "reason": "PURCHASE",
    "quantity": 50,
    "unitCost": 15.00,
    "reference": "PO-2024-001",
    "notes": "Bulk purchase from supplier ABC"
  }' | jq '.'

# Record a sale (stock OUT)
echo "Recording a sale..."
curl -s -X POST "$BASE_URL/api/stock-movements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "productId": 1,
    "type": "OUT",
    "reason": "SALE",
    "quantity": 25,
    "reference": "INV-2024-001",
    "notes": "Sale to customer XYZ Corp"
  }' | jq '.'

# Check stock levels
echo "📊 Step 7: Checking stock levels..."

echo "Total stock for Blue Widget (Product ID 1):"
curl -s -X GET "$BASE_URL/api/stock/total/1" \
  -H "Authorization: Bearer $JWT_TOKEN"

echo "Total stock for Red Gadget (Product ID 2):"
curl -s -X GET "$BASE_URL/api/stock/total/2" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get stock movement history
echo "📈 Step 8: Getting stock movement history..."

echo "Movement history for Blue Widget:"
curl -s -X GET "$BASE_URL/api/stock-movements/product/1" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# Get movement summary
echo "Movement summary for Blue Widget:"
curl -s -X GET "$BASE_URL/api/stock-movements/product/1/summary" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

# Adjust stock (for inventory correction)
echo "🔧 Step 9: Performing stock adjustment..."
curl -s -X POST "$BASE_URL/api/stock/adjust" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "productId": 1,
    "newQuantity": 120,
    "reason": "Inventory count correction",
    "notes": "Physical count revealed additional units"
  }' | jq '.'

# Check for low stock products
echo "⚠️  Step 10: Checking for low stock products..."
curl -s -X GET "$BASE_URL/api/products/low-stock" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo "✅ Demo completed successfully!"
echo "You can now explore the API endpoints manually or integrate them into your application."
