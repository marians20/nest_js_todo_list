# Stock Control System API Demo Script (PowerShell)
# This script demonstrates the complete workflow of the stock control system

Write-Host "🏭 Stock Control System API Demo" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Base URL for the API
$BaseUrl = "http://localhost:3000"

# Helper function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    $uri = "$BaseUrl$Endpoint"
    $params = @{
        Uri = $uri
        Method = $Method
        Headers = $Headers
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
        $params.Headers["Content-Type"] = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step 1: Register a user
Write-Host "📝 Step 1: Registering a user..." -ForegroundColor Yellow
$registerData = @{
    username = "stockmanager"
    email = "manager@stockdemo.com"
    password = "password123"
}

$registerResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $registerData
Write-Host "Registration response: $($registerResponse | ConvertTo-Json)" -ForegroundColor Cyan

# Step 2: Login to get JWT token
Write-Host "🔐 Step 2: Logging in to get JWT token..." -ForegroundColor Yellow
$loginData = @{
    username = "stockmanager"
    password = "password123"
}

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData
if ($loginResponse -and $loginResponse.access_token) {
    $jwtToken = $loginResponse.access_token
    Write-Host "JWT Token received: $($jwtToken.Substring(0, [Math]::Min(50, $jwtToken.Length)))..." -ForegroundColor Green
} else {
    Write-Host "Failed to get JWT token. Exiting." -ForegroundColor Red
    exit 1
}

# Set up authorization header
$authHeaders = @{
    "Authorization" = "Bearer $jwtToken"
}

# Step 3: Create products
Write-Host "📦 Step 3: Creating products..." -ForegroundColor Yellow

# Product 1: Blue Widget
Write-Host "Creating Blue Widget..." -ForegroundColor Cyan
$product1Data = @{
    sku = "WIDGET001"
    name = "Blue Widget"
    description = "High-quality blue widget for industrial use"
    category = "Widgets"
    unitPrice = 19.99
    minStockLevel = 10
}

$product1 = Invoke-ApiRequest -Method "POST" -Endpoint "/api/products" -Headers $authHeaders -Body $product1Data
Write-Host "Product 1 created: $($product1 | ConvertTo-Json)" -ForegroundColor Green

# Product 2: Red Gadget
Write-Host "Creating Red Gadget..." -ForegroundColor Cyan
$product2Data = @{
    sku = "GADGET002"
    name = "Red Gadget"
    description = "Premium red gadget with advanced features"
    category = "Gadgets"
    unitPrice = 35.50
    minStockLevel = 5
}

$product2 = Invoke-ApiRequest -Method "POST" -Endpoint "/api/products" -Headers $authHeaders -Body $product2Data
Write-Host "Product 2 created: $($product2 | ConvertTo-Json)" -ForegroundColor Green

# Step 4: List all products
Write-Host "📋 Step 4: Listing all products..." -ForegroundColor Yellow
$allProducts = Invoke-ApiRequest -Method "GET" -Endpoint "/api/products" -Headers $authHeaders
Write-Host "All products: $($allProducts | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan

# Step 5: Add initial stock
Write-Host "📥 Step 5: Adding initial stock..." -ForegroundColor Yellow

# Add stock for Blue Widget
Write-Host "Adding stock for Blue Widget..." -ForegroundColor Cyan
$stock1Data = @{
    productId = 1
    quantity = 100
    location = "Warehouse A"
    batchNumber = "BATCH001"
}

$stock1 = Invoke-ApiRequest -Method "POST" -Endpoint "/api/stock" -Headers $authHeaders -Body $stock1Data
Write-Host "Stock 1 added: $($stock1 | ConvertTo-Json)" -ForegroundColor Green

# Add stock for Red Gadget
Write-Host "Adding stock for Red Gadget..." -ForegroundColor Cyan
$stock2Data = @{
    productId = 2
    quantity = 50
    location = "Warehouse B"
    batchNumber = "BATCH002"
}

$stock2 = Invoke-ApiRequest -Method "POST" -Endpoint "/api/stock" -Headers $authHeaders -Body $stock2Data
Write-Host "Stock 2 added: $($stock2 | ConvertTo-Json)" -ForegroundColor Green

# Step 6: Record stock movements
Write-Host "📊 Step 6: Recording stock movements..." -ForegroundColor Yellow

# Record a purchase (stock IN)
Write-Host "Recording a purchase..." -ForegroundColor Cyan
$purchaseData = @{
    productId = 1
    type = "IN"
    reason = "PURCHASE"
    quantity = 50
    unitCost = 15.00
    reference = "PO-2024-001"
    notes = "Bulk purchase from supplier ABC"
}

$purchase = Invoke-ApiRequest -Method "POST" -Endpoint "/api/stock-movements" -Headers $authHeaders -Body $purchaseData
Write-Host "Purchase recorded: $($purchase | ConvertTo-Json)" -ForegroundColor Green

# Record a sale (stock OUT)
Write-Host "Recording a sale..." -ForegroundColor Cyan
$saleData = @{
    productId = 1
    type = "OUT"
    reason = "SALE"
    quantity = 25
    reference = "INV-2024-001"
    notes = "Sale to customer XYZ Corp"
}

$sale = Invoke-ApiRequest -Method "POST" -Endpoint "/api/stock-movements" -Headers $authHeaders -Body $saleData
Write-Host "Sale recorded: $($sale | ConvertTo-Json)" -ForegroundColor Green

# Step 7: Check stock levels
Write-Host "📊 Step 7: Checking stock levels..." -ForegroundColor Yellow

Write-Host "Total stock for Blue Widget (Product ID 1):" -ForegroundColor Cyan
$totalStock1 = Invoke-ApiRequest -Method "GET" -Endpoint "/api/stock/total/1" -Headers $authHeaders
Write-Host "Total: $totalStock1" -ForegroundColor Green

Write-Host "Total stock for Red Gadget (Product ID 2):" -ForegroundColor Cyan
$totalStock2 = Invoke-ApiRequest -Method "GET" -Endpoint "/api/stock/total/2" -Headers $authHeaders
Write-Host "Total: $totalStock2" -ForegroundColor Green

# Step 8: Get stock movement history
Write-Host "📈 Step 8: Getting stock movement history..." -ForegroundColor Yellow

Write-Host "Movement history for Blue Widget:" -ForegroundColor Cyan
$movements = Invoke-ApiRequest -Method "GET" -Endpoint "/api/stock-movements/product/1" -Headers $authHeaders
Write-Host "Movements: $($movements | ConvertTo-Json -Depth 3)" -ForegroundColor Green

# Get movement summary
Write-Host "Movement summary for Blue Widget:" -ForegroundColor Cyan
$summary = Invoke-ApiRequest -Method "GET" -Endpoint "/api/stock-movements/product/1/summary" -Headers $authHeaders
Write-Host "Summary: $($summary | ConvertTo-Json)" -ForegroundColor Green

# Step 9: Adjust stock
Write-Host "🔧 Step 9: Performing stock adjustment..." -ForegroundColor Yellow
$adjustmentData = @{
    productId = 1
    newQuantity = 120
    reason = "Inventory count correction"
    notes = "Physical count revealed additional units"
}

$adjustment = Invoke-ApiRequest -Method "POST" -Endpoint "/api/stock/adjust" -Headers $authHeaders -Body $adjustmentData
Write-Host "Stock adjusted: $($adjustment | ConvertTo-Json)" -ForegroundColor Green

# Step 10: Check for low stock
Write-Host "⚠️  Step 10: Checking for low stock products..." -ForegroundColor Yellow
$lowStock = Invoke-ApiRequest -Method "GET" -Endpoint "/api/products/low-stock" -Headers $authHeaders
Write-Host "Low stock products: $($lowStock | ConvertTo-Json -Depth 3)" -ForegroundColor Green

Write-Host "✅ Demo completed successfully!" -ForegroundColor Green
Write-Host "You can now explore the API endpoints manually or integrate them into your application." -ForegroundColor Cyan
