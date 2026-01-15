# Open Food Facts API Integration

## Overview
This integration fetches real-world product data from the Open Food Facts API and stores it in MongoDB. The system automatically syncs 200 products (2 pages × 100 products each) with pagination support.

## Changes Made

### 1. Schema Updates (`schemas.py`)
The `ProductBase` schema was updated to support OpenFoodFacts data:

**New Fields:**
- `brand`: Made optional (OpenFoodFacts may not always provide this)
- `description`: Made optional (replaced with categories from OpenFoodFacts)
- `barcode`: New field for storing product barcode codes
- `source`: New field tracking data source ("manual" or "openfoodfacts")

**Updated Field Types:**
- `price` now defaults to `0.0` (can be manually set)
- `stock` defaults to `0` (can be manually updated)

### 2. Database Changes (`models.py`)
Added new collection for tracking sync status:
- `api_sync_collection`: Stores OpenFoodFacts sync metadata and status

### 3. Backend Updates (`main.py`)
Added the `requests` library import for HTTP calls.
Updated `product_helper()` function to include `barcode` and `source` fields.

## New API Endpoints

### 1. **POST** `/products/sync-openfoodfacts`
Initiates a sync with the OpenFoodFacts API and fetches 200 products.

**Authentication:** Required (Bearer Token)

**Query Parameters:** None

**Request Body:** Empty

**Response:**
```json
{
  "message": "OpenFoodFacts sync completed successfully",
  "products_added": 150,
  "total_products_processed": 200,
  "pages_processed": 2
}
```

**Features:**
- Pagination: Fetches 2 pages of 100 products each
- Deduplication: Skips products that already exist (by barcode)
- Error Handling: Logs errors per page but continues processing
- Progress Tracking: Marks sync as "in_progress" and updates on completion
- Prevents duplicate syncs: Rejects if sync is already running

**Data Fetched:**
- Product Name
- Barcode (code)
- Brand
- Categories
- Image URL
- Energy content

### 2. **GET** `/products/sync-status`
Retrieves the current or last sync status.

**Authentication:** Required (Bearer Token)

**Response Example:**
```json
{
  "source": "openfoodfacts",
  "status": "completed",
  "started_at": "2026-01-15T10:30:45.123456",
  "completed_at": "2026-01-15T10:35:22.456789",
  "products_added": 150,
  "total_products_processed": 200,
  "error": null
}
```

**Possible Status Values:**
- `never_synced`: No sync has been performed yet
- `in_progress`: Sync is currently running
- `completed`: Last sync completed successfully
- `failed`: Last sync encountered an error

### 3. **GET** `/products/by-barcode/{barcode}`
Fetch a product by its barcode code.

**Authentication:** Required (Bearer Token)

**Parameters:**
- `barcode` (path): The product barcode

**Response:** ProductResponse object

**Example:**
```
GET /products/by-barcode/6111035000430
```

## How It Works

### Sync Process Flow
1. Check if sync is already in progress
2. Mark sync status as "in_progress" in MongoDB
3. Fetch data from OpenFoodFacts API (2 pages, 100 products each)
4. For each product:
   - Validate product name exists
   - Check if product already exists (by barcode)
   - Transform OpenFoodFacts data to match our schema
   - Insert into MongoDB if new
5. Update sync status with results
6. Return summary statistics

### Data Transformation
OpenFoodFacts API data → MongoDB Schema:

| OpenFoodFacts Field | Our Field | Notes |
|---|---|---|
| `product_name` | `name` | Required |
| `code` | `barcode` | Used for deduplication |
| `brands` | `brand` | May be empty |
| `categories` | `description`, `category` | First category used as category |
| `image_front_url` | `images` (array) | Single image wrapped in array |
| N/A | `price` | Defaults to 0.0 |
| N/A | `stock` | Defaults to 0 |
| N/A | `source` | Set to "openfoodfacts" |

## All Existing APIs Still Work

The integration is **fully backward compatible**:

- ✅ **GET** `/products` - Lists all products (manual + OpenFoodFacts)
- ✅ **GET** `/products/{product_id}` - Get specific product
- ✅ **POST** `/products` - Create manual products (price/stock required)
- ✅ **PUT** `/products/{product_id}` - Update any product (including OpenFoodFacts products)
- ✅ **DELETE** `/products/{product_id}` - Delete any product
- ✅ **POST** `/invoices` - Works with all products
- ✅ **GET** `/wishlist/{user_id}` - Works with all products
- ✅ **GET** `/cart/{user_id}` - Works with all products
- ✅ **All KPI endpoints** - Aggregate across all products

## Usage Example

### Step 1: Authenticate
```bash
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=yourpassword"
```

### Step 2: Trigger Sync
```bash
curl -X POST "http://localhost:8000/products/sync-openfoodfacts" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Check Sync Status
```bash
curl -X GET "http://localhost:8000/products/sync-status" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Search Products by Barcode
```bash
curl -X GET "http://localhost:8000/products/by-barcode/6111035000430" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 5: Add OpenFoodFacts Products to Cart
```bash
curl -X POST "http://localhost:8000/cart/{user_id}" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "PRODUCT_MONGO_ID", "quantity": 2}'
```

## Important Notes

1. **Price & Stock:** OpenFoodFacts data doesn't include price or stock information. These default to 0 and can be manually updated via the PUT endpoint.

2. **User-Agent:** The API uses a required User-Agent header to comply with OpenFoodFacts API requirements.

3. **Timeout:** Each API request has a 10-second timeout to prevent hanging.

4. **Pagination:** Currently fetches 200 products (2 pages × 100). Can be increased by changing the range in the loop from `range(1, 3)` to `range(1, X)`.

5. **Deduplication:** Products are deduplicated by barcode. If a product with the same barcode exists, it won't be re-added.

6. **Source Tracking:** All products have a `source` field:
   - `"manual"` for products created via POST /products
   - `"openfoodfacts"` for synced products

## Troubleshooting

### Sync Already in Progress
If you get "Sync already in progress" error, check the sync status:
```bash
curl -X GET "http://localhost:8000/products/sync-status" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### No Products Added
This could happen if:
- All products in the API pages already exist in your DB
- Network issues prevented API calls
- Products don't have valid names

Check the returned `total_products_processed` vs `products_added` ratio.

### API Timeouts
If the sync times out, it's likely a network issue. Try again in a few moments.

## Performance Considerations

- Initial sync of 200 products typically takes 5-15 seconds
- Deduplication check happens per product (negligible impact)
- MongoDB bulk inserts would be faster for larger volumes
- Consider implementing retry logic for production

## Future Enhancements

- Add more fields from OpenFoodFacts (nutrition, allergens, etc.)
- Implement incremental syncs instead of full syncs
- Add filtering/search by OpenFoodFacts data
- Bulk insert optimization for large datasets
- Scheduled automatic syncs via background jobs
