# MeethaCart — REST API Documentation (M1, M2, M3)

This document provides the complete API contracts, request payloads, response structures, and HTTP status codes for MeethaCart modules M1, M2, and M3.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Profile APIs (M1)

### 1.1 `POST /auth/register`
Register a new Buyer or Seller. Sends a 6-digit OTP to the registered email.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Ayesha Khan",
    "email": "ayesha@example.com",
    "password": "Password123!",
    "role": "seller", // "buyer" | "seller"
    "preferredLanguage": "en", // "en" | "ur"
    "bakeryName": "Ayesha's Sweet Delights", // required if role=seller
    "phone": "03001234567"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration initiated. 6-digit verification OTP sent to your email.",
    "email": "ayesha@example.com",
    "cooldownSeconds": 60
  }
  ```

### 1.2 `POST /auth/verify-otp`
Verifies signup OTP and activates account (`isVerified = true`).
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "ayesha@example.com",
    "otp": "482910",
    "purpose": "signup_verification"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Account verified successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "673...",
      "name": "Ayesha Khan",
      "email": "ayesha@example.com",
      "role": "seller",
      "isVerified": true,
      "sellerStatus": "pending",
      "preferredLanguage": "en"
    }
  }
  ```

### 1.3 `POST /auth/login`
Step 1 of 2FA login. Verifies email & password, then sends fresh 6-digit OTP.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "ayesha@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Credentials verified. 6-digit login OTP sent to your email.",
    "email": "ayesha@example.com",
    "cooldownSeconds": 60
  }
  ```

### 1.4 `POST /auth/verify-login-otp`
Step 2 of 2FA login. Verifies OTP and issues the session JWT token.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "ayesha@example.com",
    "otp": "839102"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "673...",
      "name": "Ayesha Khan",
      "email": "ayesha@example.com",
      "role": "seller",
      "isVerified": true,
      "sellerStatus": "pending",
      "preferredLanguage": "en"
    }
  }
  ```

### 1.5 `POST /auth/resend-otp`
Resends OTP subject to a 60-second cooldown and hourly limit (max 5 per hour).
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "ayesha@example.com",
    "purpose": "signup_verification" // or "login_2fa" or "password_reset"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "New OTP dispatched to email.",
    "cooldownSeconds": 60
  }
  ```

### 1.6 `POST /auth/forgot-password`
Generates password recovery OTP.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "ayesha@example.com"
  }
  ```

### 1.7 `POST /auth/reset-password`
Verifies OTP and resets user password.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "ayesha@example.com",
    "otp": "192847",
    "newPassword": "NewSecurePassword456!"
  }
  ```

### 1.8 `GET /users/me`
Fetches authenticated user's profile.
* **Access**: Protected (`Authorization: Bearer <token>`)

### 1.9 `PUT /users/profile`
Updates user profile info, address, phone, bio, preferred language.
* **Access**: Protected (`Authorization: Bearer <token>`)

### 1.10 `GET /users/seller/:id`
Public profile of a baker showing bakery name, bio, and active bakery items.
* **Access**: Public

---

## 2. Admin Panel APIs (M2)

### 2.1 `GET /admin/metrics`
Platform KPIs: total users, approved sellers, pending sellers, total bakery items.
* **Access**: Protected (`Role: admin`)

### 2.2 `GET /admin/sellers`
List all sellers with optional query `?status=pending|approved|blocked`.
* **Access**: Protected (`Role: admin`)

### 2.3 `PATCH /admin/sellers/:id/status`
Approve or block a seller.
* **Access**: Protected (`Role: admin`)
* **Request Body**:
  ```json
  {
    "status": "approved" // "approved" | "blocked" | "pending"
  }
  ```

### 2.4 `GET /admin/users`
List all users with pagination and role filter (`?role=buyer&page=1`).
* **Access**: Protected (`Role: admin`)

### 2.5 `POST /categories`
Create a bakery category.
* **Access**: Protected (`Role: admin`)

### 2.6 `PUT /categories/:id`
Update a category name, description, or image.
* **Access**: Protected (`Role: admin`)

### 2.7 `DELETE /categories/:id`
Delete category (rejects if items are assigned to it).
* **Access**: Protected (`Role: admin`)

### 2.8 `GET /admin/orders`
Orders endpoint (returns empty array and structure for M4).
* **Access**: Protected (`Role: admin`)

---

## 3. Bakery Items & Catalog APIs (M3)

### 3.1 `GET /categories`
Public list of all active bakery categories.
* **Access**: Public

### 3.2 `GET /items`
Browse bakery catalog with multi-criteria filters.
* **Access**: Public
* **Query Parameters**:
  * `search`: Text query matching title or description
  * `category`: Category ID or slug
  * `minPrice`: Minimum price in PKR
  * `maxPrice`: Maximum price in PKR
  * `seller`: Seller ID
  * `sort`: `price_asc` | `price_desc` | `newest`
  * `page`: Page number (default: 1)
  * `limit`: Results per page (default: 12)

### 3.3 `GET /items/:id`
Public detailed view of a bakery item with seller info.
* **Access**: Public

### 3.4 `GET /items/seller/my-items`
List items belonging to the authenticated seller.
* **Access**: Protected (`Role: seller`)

### 3.5 `POST /items`
Add a new bakery item with multipart image uploads.
* **Access**: Protected (`Role: seller` AND `sellerStatus: approved`)

### 3.6 `PUT /items/:id`
Update an item owned by the seller.
* **Access**: Protected (`Role: seller` AND `sellerStatus: approved`)

### 3.7 `DELETE /items/:id`
Delete an item owned by the seller.
* **Access**: Protected (`Role: seller` AND `sellerStatus: approved`)
