# Authentication Module API Documentation

## Overview
This module handles user authentication, registration, password management, and email verification.

---

## Public Endpoints (No Authentication Required)

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account and sends a welcome email with verification link.

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)",
  "full_name": "string (required, 2-255 characters)",
  "phone": "string (required, 10-20 characters, valid phone format)",
  "role": "string (optional, one of: 'ADMIN', 'MAINTENANCE', 'TECHNICIEN', default: 'TECHNICIEN')"
}
```

**Example Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "TECHNICIEN"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "role": "TECHNICIEN",
      "is_email_verified": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "access_token": "jwt-access-token",
      "refresh_token": "jwt-refresh-token"
    },
    "verification_token": "token-string" // Only in development mode
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
  ```json
  {
    "success": false,
    "message": "Password must be at least 8 characters long, Password must contain at least one uppercase letter"
  }
  ```
- `409 Conflict`: Email already exists
  ```json
  {
    "success": false,
    "message": "User with this email already exists"
  }
  ```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates user and returns JWT tokens.

**Rate Limit:** 5 attempts per 15 minutes

**Request Body:**
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required)"
}
```

**Example Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "profile_picture": null,
      "role": "TECHNICIEN",
      "is_email_verified": false,
      "last_login_at": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "access_token": "jwt-access-token",
      "refresh_token": "jwt-refresh-token"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```
- `401 Unauthorized`: Account deactivated
  ```json
  {
    "success": false,
    "message": "Account is deactivated. Please contact administrator."
  }
  ```

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Generates new access and refresh tokens using a valid refresh token.

**Request Body:**
```json
{
  "refresh_token": "string (required, valid refresh token)"
}
```

**Example Request:**
```json
{
  "refresh_token": "jwt-refresh-token"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "access_token": "new-jwt-access-token",
      "refresh_token": "new-jwt-refresh-token"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token
  ```json
  {
    "success": false,
    "message": "Invalid or expired refresh token"
  }
  ```

---

### 4. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Sends password reset email to user.

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "email": "string (required, valid email format)"
}
```

**Example Request:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "reset_token": "token-string" // Only in development mode
}
```

**Note:** Always returns success message for security (doesn't reveal if email exists).

---

### 5. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Resets user password using reset token from email.

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "token": "string (required, reset token from email)",
  "password": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)"
}
```

**Example Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
  ```json
  {
    "success": false,
    "message": "Invalid or expired reset token"
  }
  ```

---

### 6. Verify Email

**Endpoint:** `POST /api/auth/verify-email`

**Description:** Verifies user email address using verification token.

**Request Body:**
```json
{
  "token": "string (required, verification token from email)"
}
```

**Example Request:**
```json
{
  "token": "verification-token-from-email"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Already verified
  ```json
  {
    "success": false,
    "message": "Email is already verified"
  }
  ```
- `401 Unauthorized`: Invalid or expired token
  ```json
  {
    "success": false,
    "message": "Invalid or expired verification token"
  }
  ```

---

## Protected Endpoints (Authentication Required)

All protected endpoints require `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

### 7. Logout User

**Endpoint:** `POST /api/auth/logout`

**Description:** Logs out user by invalidating refresh token.

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
  ```json
  {
    "success": false,
    "message": "Unauthorized"
  }
  ```

---

### 8. Get Current User Profile

**Endpoint:** `GET /api/auth/me`

**Description:** Returns current authenticated user's profile information.

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "profile_picture": null,
      "role": "TECHNICIEN",
      "is_active": true,
      "is_email_verified": false,
      "last_login_at": "2024-01-15T10:30:00.000Z",
      "last_login_ip": "192.168.1.1",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
  ```json
  {
    "success": false,
    "message": "Unauthorized"
  }
  ```
- `404 Not Found`: User not found
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```

---

### 9. Update User Profile

**Endpoint:** `PUT /api/auth/profile`

**Description:** Updates current user's profile information.

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "full_name": "string (optional, 2-255 characters)",
  "phone": "string (optional, 10-20 characters, valid phone format)",
  "profile_picture": "string (optional, valid URL)"
}
```

**Example Request:**
```json
{
  "full_name": "John Updated Doe",
  "phone": "+1234567891",
  "profile_picture": "https://example.com/avatar.jpg"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "full_name": "John Updated Doe",
      "phone": "+1234567891",
      "profile_picture": "https://example.com/avatar.jpg",
      "role": "TECHNICIEN",
      "is_email_verified": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
  ```json
  {
    "success": false,
    "message": "Phone number must be between 10 and 20 characters"
  }
  ```
- `401 Unauthorized`: Not authenticated

---

### 10. Change Password

**Endpoint:** `PUT /api/auth/change-password`

**Description:** Changes user's password (requires current password).

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_password": "string (required)",
  "new_password": "string (required, min 8 chars, must contain uppercase, lowercase, number, special char)"
}
```

**Example Request:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewSecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Note:** A confirmation email is sent to the user.

**Error Responses:**
- `401 Unauthorized`: Incorrect current password
  ```json
  {
    "success": false,
    "message": "Current password is incorrect"
  }
  ```
- `400 Bad Request`: Validation errors

---

### 11. Resend Verification Email

**Endpoint:** `POST /api/auth/resend-verification`

**Description:** Resends email verification link to current user.

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "verification_token": "token-string" // Only in development mode
}
```

**Error Responses:**
- `400 Bad Request`: Email already verified
  ```json
  {
    "success": false,
    "message": "Email is already verified"
  }
  ```
- `401 Unauthorized`: Not authenticated

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

### 429 Too Many Requests (Rate Limit)
```json
{
  "success": false,
  "message": "Too many login attempts, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Token Information

### Access Token
- **Type:** JWT
- **Expiration:** 15 minutes (configurable via `JWT_ACCESS_EXPIRES_IN`)
- **Usage:** Include in `Authorization` header for protected endpoints
- **Format:** `Bearer <token>`

### Refresh Token
- **Type:** JWT
- **Expiration:** 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Usage:** Use with `/api/auth/refresh-token` endpoint
- **Storage:** Stored in database, invalidated on logout

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|-------|
| `/api/auth/register` | 3 requests | 1 hour |
| `/api/auth/login` | 5 attempts | 15 minutes |
| `/api/auth/forgot-password` | 3 requests | 1 hour |
| `/api/auth/reset-password` | 3 requests | 1 hour |
| All other endpoints | 100 requests | 15 minutes |

---

## Notes

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **Email Verification:**
   - Verification token expires in 24 hours
   - Users can request new verification email
   - Email verification is optional but recommended

3. **Password Reset:**
   - Reset token expires in 1 hour
   - Token can only be used once
   - Confirmation email sent after successful reset

4. **Development Mode:**
   - Tokens may be returned in responses for testing
   - Email content logged to console if SMTP not configured
