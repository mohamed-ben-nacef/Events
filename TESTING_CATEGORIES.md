# Categories & Subcategories Module - Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions, examples, and expected results for the Categories & Subcategories module.

---

## 🔐 Prerequisites

1. **Authentication Required**: All endpoints require a valid JWT access token
2. **Admin Role Required**: Create, Update, Delete operations require ADMIN role
3. **Get Token**: Login first at `POST /api/auth/login`

---

## 📂 Categories Endpoints

### 1. Get All Categories

**Endpoint:** `GET /api/categories`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `includeSubcategories` (optional, boolean): Include subcategories in response
  - `true` (default): Returns categories with their subcategories
  - `false`: Returns only categories without subcategories

**Example Request:**
```bash
GET http://localhost:3000/api/categories?includeSubcategories=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "SON",
        "description": "Audio equipment category",
        "icon": "https://example.com/icons/son.png",
        "subcategories": [
          {
            "id": "223e4567-e89b-12d3-a456-426614174000",
            "category_id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Microphones",
            "description": "Wireless and wired microphones",
            "created_at": "2024-01-15T10:30:00.000Z",
            "updated_at": "2024-01-15T10:30:00.000Z"
          }
        ],
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "323e4567-e89b-12d3-a456-426614174000",
        "name": "VIDEO",
        "description": "Video equipment category",
        "icon": null,
        "subcategories": [],
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Notes:**
- Categories are sorted alphabetically by name
- Categories without subcategories will have empty `subcategories` array
- All authenticated users can access this endpoint

---

### 2. Get Category by ID

**Endpoint:** `GET /api/categories/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (required, UUID): Category ID

**Example Request:**
```bash
GET http://localhost:3000/api/categories/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "SON",
      "description": "Audio equipment category",
      "icon": "https://example.com/icons/son.png",
      "subcategories": [
        {
          "id": "223e4567-e89b-12d3-a456-426614174000",
          "name": "Microphones",
          "description": "Wireless and wired microphones"
        }
      ],
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid UUID format
  ```json
  {
    "success": false,
    "message": "Invalid category ID"
  }
  ```
- `404 Not Found`: Category doesn't exist
  ```json
  {
    "success": false,
    "message": "Category not found"
  }
  ```

---

### 3. Create Category

**Endpoint:** `POST /api/categories`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (required, 1-100 chars, unique)",
  "description": "string (optional, max 1000 chars)",
  "icon": "string (optional, valid URL, max 255 chars)"
}
```

**Example Request:**
```json
{
  "name": "SON",
  "description": "Audio equipment category including microphones, speakers, mixers, and audio processors",
  "icon": "https://example.com/icons/son.png"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "SON",
      "description": "Audio equipment category including microphones, speakers, mixers, and audio processors",
      "icon": "https://example.com/icons/son.png",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
  ```json
  {
    "success": false,
    "message": "Category name must be between 1 and 100 characters"
  }
  ```
- `409 Conflict`: Category name already exists
  ```json
  {
    "success": false,
    "message": "Category with this name already exists"
  }
  ```
- `403 Forbidden`: Not an admin
  ```json
  {
    "success": false,
    "message": "Insufficient permissions"
  }
  ```

**Important Notes:**
- Category names are case-insensitive (SON = son = Son)
- Category can exist without subcategories
- Icon must be a valid URL if provided

---

### 4. Update Category

**Endpoint:** `PUT /api/categories/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (required, UUID): Category ID

**Request Body:** (All fields optional)
```json
{
  "name": "string (optional, 1-100 chars)",
  "description": "string (optional, max 1000 chars)",
  "icon": "string (optional, valid URL)"
}
```

**Example Request:**
```json
{
  "description": "Updated description for audio equipment",
  "icon": "https://example.com/icons/son-updated.png"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "SON",
      "description": "Updated description for audio equipment",
      "icon": "https://example.com/icons/son-updated.png",
      "subcategories": [...],
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Category doesn't exist
- `409 Conflict`: New name already exists
- `403 Forbidden`: Not an admin

---

### 5. Delete Category

**Endpoint:** `DELETE /api/categories/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Parameters:**
- `id` (required, UUID): Category ID

**Example Request:**
```bash
DELETE http://localhost:3000/api/categories/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <admin_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Category has associated equipment
  ```json
  {
    "success": false,
    "message": "Cannot delete category. It has 5 associated equipment item(s). Please remove or reassign equipment first."
  }
  ```
- `404 Not Found`: Category doesn't exist
- `403 Forbidden`: Not an admin

**Important Notes:**
- Deleting a category automatically deletes all its subcategories (CASCADE)
- Cannot delete if equipment is associated with the category
- This is a permanent action

---

## 📋 Subcategories Endpoints

### 6. Get All Subcategories

**Endpoint:** `GET /api/subcategories`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `categoryId` (optional, UUID): Filter subcategories by category

**Example Request:**
```bash
GET http://localhost:3000/api/subcategories?categoryId=123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subcategories": [
      {
        "id": "223e4567-e89b-12d3-a456-426614174000",
        "category_id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Microphones",
        "description": "Wireless and wired microphones",
        "category": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
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

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (required, UUID): Subcategory ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subcategory": {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "category_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Microphones",
      "description": "Wireless and wired microphones",
      "category": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "SON",
        "description": "Audio equipment category"
      },
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 8. Create Subcategory

**Endpoint:** `POST /api/subcategories`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category_id": "uuid (required)",
  "name": "string (required, 1-100 chars, unique per category)",
  "description": "string (optional, max 1000 chars)"
}
```

**Example Request:**
```json
{
  "category_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Microphones",
  "description": "Wireless and wired microphones, handheld, lapel, and headset microphones"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Subcategory created successfully",
  "data": {
    "subcategory": {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "category_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Microphones",
      "description": "Wireless and wired microphones, handheld, lapel, and headset microphones",
      "category": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "SON"
      },
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or invalid category_id
- `404 Not Found`: Category doesn't exist
  ```json
  {
    "success": false,
    "message": "Category not found"
  }
  ```
- `409 Conflict`: Subcategory name already exists in this category
  ```json
  {
    "success": false,
    "message": "Subcategory with this name already exists in this category"
  }
  ```

**Important Notes:**
- Subcategory names must be unique within the same category
- Same subcategory name can exist in different categories
- Category must exist before creating subcategory

---

### 9. Update Subcategory

**Endpoint:** `PUT /api/subcategories/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (required, UUID): Subcategory ID

**Request Body:** (All fields optional)
```json
{
  "category_id": "uuid (optional)",
  "name": "string (optional, 1-100 chars)",
  "description": "string (optional, max 1000 chars)"
}
```

**Example Request:**
```json
{
  "name": "Microphones Updated",
  "description": "Updated description for microphones"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Subcategory updated successfully",
  "data": {
    "subcategory": {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "category_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Microphones Updated",
      "description": "Updated description for microphones",
      "category": {...},
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Subcategory or new category doesn't exist
- `409 Conflict`: New name already exists in the category
- `403 Forbidden`: Not an admin

**Note:** You can move a subcategory to a different category by updating `category_id`

---

### 10. Delete Subcategory

**Endpoint:** `DELETE /api/subcategories/:id`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Path Parameters:**
- `id` (required, UUID): Subcategory ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Subcategory deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Subcategory has associated equipment
  ```json
  {
    "success": false,
    "message": "Cannot delete subcategory. It has 3 associated equipment item(s). Please remove or reassign equipment first."
  }
  ```
- `404 Not Found`: Subcategory doesn't exist
- `403 Forbidden`: Not an admin

---

## 🧪 Testing Scenarios

### Scenario 1: Create Category Without Subcategories
1. Create category "SON"
2. Verify it exists
3. Verify `subcategories` array is empty

### Scenario 2: Create Category With Subcategories
1. Create category "VIDEO"
2. Create subcategory "Cameras" under VIDEO
3. Create subcategory "Projectors" under VIDEO
4. Get category and verify both subcategories are included

### Scenario 3: Duplicate Name Prevention
1. Create category "SON"
2. Try to create another "SON" → Should fail with 409
3. Create subcategory "Microphones" under SON
4. Try to create another "Microphones" under SON → Should fail with 409
5. Create "Microphones" under different category → Should succeed

### Scenario 4: Delete Protection
1. Create category and add equipment to it
2. Try to delete category → Should fail with 400 (has equipment)
3. Remove equipment
4. Delete category → Should succeed

### Scenario 5: Cascade Delete
1. Create category with subcategories
2. Delete category
3. Verify all subcategories are also deleted

---

## 📝 Common Request Examples

### Create All Main Categories
```json
// 1. SON
{
  "name": "SON",
  "description": "Audio equipment category"
}

// 2. VIDEO
{
  "name": "VIDEO",
  "description": "Video equipment category"
}

// 3. LUMIERE
{
  "name": "LUMIERE",
  "description": "Lighting equipment category"
}
```

### Create Subcategories for SON
```json
// Microphones
{
  "category_id": "<SON_CATEGORY_ID>",
  "name": "Microphones",
  "description": "Wireless and wired microphones"
}

// Speakers
{
  "category_id": "<SON_CATEGORY_ID>",
  "name": "Speakers",
  "description": "Active and passive speakers"
}

// Mixers
{
  "category_id": "<SON_CATEGORY_ID>",
  "name": "Mixers",
  "description": "Audio mixing consoles"
}
```

---

## ⚠️ Important Notes

1. **Authentication**: All endpoints require valid JWT token
2. **Admin Only**: Create, Update, Delete require ADMIN role
3. **Case Insensitive**: Category and subcategory names are case-insensitive for uniqueness
4. **Cascade Delete**: Deleting category deletes all subcategories
5. **Delete Protection**: Cannot delete if equipment is associated
6. **Optional Subcategories**: Categories can exist without subcategories
7. **Unique Names**: 
   - Category names must be unique globally
   - Subcategory names must be unique per category

---

## 🔗 Related Documentation

- Full API Documentation: `docs/API_CATEGORIES.md`
- Authentication Guide: `docs/API_AUTH.md`
