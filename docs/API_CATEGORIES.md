# Categories & Subcategories Module API Documentation

## Overview
This module handles equipment categories (SON, VIDEO, LUMIERE) and their subcategories.

---

## Categories Endpoints

### 1. Get All Categories

**Endpoint:** `GET /api/categories`

**Description:** Retrieves all categories with their subcategories.

**Authentication:** Required

**Request Body:** None

**Query Parameters:**
- `includeSubcategories` (optional, boolean): Include subcategories in response (default: true)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "SON",
        "description": "Audio equipment category",
        "icon": "icon-url",
        "subcategories": [
          {
            "id": "uuid",
            "name": "Microphones",
            "description": "Various microphone types",
            "created_at": "2024-01-15T10:30:00.000Z"
          }
        ],
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 2. Get Category by ID

**Endpoint:** `GET /api/categories/:id`

**Description:** Retrieves a specific category by ID.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Category ID

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "SON",
      "description": "Audio equipment category",
      "icon": "icon-url",
      "subcategories": [...],
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Category not found

---

### 3. Create Category

**Endpoint:** `POST /api/categories`

**Description:** Creates a new category.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "string (required, unique, max 100 chars)",
  "description": "string (optional)",
  "icon": "string (optional, URL)"
}
```

**Example Request:**
```json
{
  "name": "SON",
  "description": "Audio equipment category",
  "icon": "https://example.com/son-icon.png"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "uuid",
      "name": "SON",
      "description": "Audio equipment category",
      "icon": "https://example.com/son-icon.png",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Category name already exists

---

### 4. Update Category

**Endpoint:** `PUT /api/categories/:id`

**Description:** Updates an existing category.

**Authentication:** Required (Admin only)

**Request Parameters:**
- `id` (path parameter, UUID): Category ID

**Request Body:**
```json
{
  "name": "string (optional, unique, max 100 chars)",
  "description": "string (optional)",
  "icon": "string (optional, URL)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": "uuid",
      "name": "SON",
      "description": "Updated description",
      "icon": "updated-icon-url",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Category

**Endpoint:** `DELETE /api/categories/:id`

**Description:** Deletes a category (cascades to subcategories).

**Authentication:** Required (Admin only)

**Request Parameters:**
- `id` (path parameter, UUID): Category ID

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Category not found
- `400 Bad Request`: Category has associated equipment

---

## Subcategories Endpoints

### 6. Get All Subcategories

**Endpoint:** `GET /api/subcategories`

**Description:** Retrieves all subcategories, optionally filtered by category.

**Authentication:** Required

**Query Parameters:**
- `categoryId` (optional, UUID): Filter by category ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subcategories": [
      {
        "id": "uuid",
        "category_id": "uuid",
        "name": "Microphones",
        "description": "Various microphone types",
        "category": {
          "id": "uuid",
          "name": "SON"
        },
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 7. Get Subcategory by ID

**Endpoint:** `GET /api/subcategories/:id`

**Description:** Retrieves a specific subcategory by ID.

**Authentication:** Required

**Request Parameters:**
- `id` (path parameter, UUID): Subcategory ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subcategory": {
      "id": "uuid",
      "category_id": "uuid",
      "name": "Microphones",
      "description": "Various microphone types",
      "category": {...},
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 8. Create Subcategory

**Endpoint:** `POST /api/subcategories`

**Description:** Creates a new subcategory.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "category_id": "uuid (required)",
  "name": "string (required, max 100 chars, unique per category)",
  "description": "string (optional)"
}
```

**Example Request:**
```json
{
  "category_id": "category-uuid",
  "name": "Microphones",
  "description": "Various microphone types"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Subcategory created successfully",
  "data": {
    "subcategory": {
      "id": "uuid",
      "category_id": "uuid",
      "name": "Microphones",
      "description": "Various microphone types",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `404 Not Found`: Category not found
- `409 Conflict`: Subcategory name already exists for this category

---

### 9. Update Subcategory

**Endpoint:** `PUT /api/subcategories/:id`

**Description:** Updates an existing subcategory.

**Authentication:** Required (Admin only)

**Request Parameters:**
- `id` (path parameter, UUID): Subcategory ID

**Request Body:**
```json
{
  "category_id": "uuid (optional)",
  "name": "string (optional, max 100 chars)",
  "description": "string (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Subcategory updated successfully",
  "data": {
    "subcategory": {...}
  }
}
```

---

### 10. Delete Subcategory

**Endpoint:** `DELETE /api/subcategories/:id`

**Description:** Deletes a subcategory.

**Authentication:** Required (Admin only)

**Request Parameters:**
- `id` (path parameter, UUID): Subcategory ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Subcategory deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Subcategory not found
- `400 Bad Request`: Subcategory has associated equipment
