# 🏨 Hotel Reservation API - Comprehensive API Documentation

RESTful API built with **Node.js, Express 5, MongoDB (Mongoose), and JWT** for managing hotels, rooms, reservations, payments, and real-time room availability.

A ready-to-import Postman Collection is included in the project:  
👉 **[`hotel-reservation-api.postman_collection.json`](./hotel-reservation-api.postman_collection.json)**

---

## 📑 Table of Contents

1. [Project Setup & Environment](#1-project-setup--environment)
2. [How to Import into Postman](#2-how-to-import-into-postman)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [API Endpoints Reference](#4-api-endpoints-reference)
    - [0. System / Health Check](#0-system--health-check)
    - [1. Authentication (`/api/auth`)](#1-authentication-apiauth)
    - [2. User Management (`/api/users`)](#2-user-management-apiusers)
    - [3. Hotel Management (`/api/hotels`)](#3-hotel-management-apihotels)
    - [4. Room Management (`/api/rooms`)](#4-room-management-apirooms)
    - [5. Reservations (`/api/reservations`)](#5-reservations-apireservations)
    - [6. Payments (`/api/payments`)](#6-payments-apipayments)
    - [7. Availability & Search (`/api/availability`)](#7-availability--search-apiavailability)
5. [Error Handling & Status Codes](#5-error-handling--status-codes)

---

## 1. Project Setup & Environment

### Environment Variables (`.env`)

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hotel_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_SIGNUP_KEY=your_secret_admin_registration_key
```

### Running the Server

```bash
# Install dependencies
npm install

# Start development server with Nodemon
npm run dev

# Or start standard production server
npm start
```

The server will boot up at `http://localhost:5000`.

---

## 2. How to Import into Postman

### Step 1: Open Postman

Launch the Postman desktop app or Postman Web.

### Step 2: Import the Collection

1. Click the **Import** button in the top-left sidebar in Postman.
2. Select or drag & drop the file:  
   `hotel-reservation-api.postman_collection.json`
3. Click **Import**.

### Step 3: Automatic Token & Variable Handling

This collection comes pre-configured with **Postman Test Scripts**:

- When you run **Customer Login** or **Customer Register**, the returned JWT token is **automatically stored** in the collection variable `{{authToken}}`.
- When you run **Admin Login** or **Admin Register**, the token is **automatically stored** in `{{adminToken}}`.
- Subsequent authenticated requests (e.g., `/api/auth/me`, `/api/users/me`, `/api/payments`) automatically inherit `Authorization: Bearer {{authToken}}`.
- Dynamic IDs (`hotelId`, `roomId`, `reservationId`, `paymentId`, `userId`) are automatically updated when you create corresponding resources.

---

## 3. Authentication & Authorization

All secure endpoints expect a standard HTTP `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

### User Roles

- **`customer`**: Can search availability, manage own profile, create reservations, and simulate payments.
- **`admin`**: Can view all registered users, modify roles, deactivate accounts, and manage hotel/room inventories.

### Password Policy

Passwords must:

- Be at least 8 characters long
- Contain at least one letter (`[A-Za-z]`)
- Contain at least one number (`[0-9]`)

---

## 4. API Endpoints Reference

### 0. System / Health Check

#### `GET /`

Verifies that the server is online.

- **Request:** None
- **Response `200 OK`:**

```json
{
    "message": "Hotel Reservation API is running"
}
```

---

### 1. Authentication (`/api/auth`)

#### `POST /api/auth/register`

Registers a new customer account.

- **Headers:** `Content-Type: application/json`
- **Request Body:**

```json
{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password123",
    "phone": "+2348012345678"
}
```

- **Response `201 Created`:**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "670d65a88c7fbb9d12345678",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+2348012345678",
        "role": "customer",
        "isActive": true,
        "createdAt": "2026-10-14T19:00:00.000Z"
    }
}
```

#### `POST /api/auth/register-admin`

Registers a new administrator. Requires the server's `ADMIN_SIGNUP_KEY`.

- **Headers:** `Content-Type: application/json`
- **Request Body:**

```json
{
    "name": "System Admin",
    "email": "admin@example.com",
    "password": "AdminSecure123",
    "phone": "+2348099887766",
    "adminKey": "your_secret_admin_registration_key"
}
```

- **Response `201 Created`:** Same structure as above with `"role": "admin"`.

#### `POST /api/auth/login`

Authenticates an existing user (customer or admin).

- **Request Body:**

```json
{
    "email": "jane.doe@example.com",
    "password": "Password123"
}
```

- **Response `200 OK`:**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "_id": "670d65a88c7fbb9d12345678",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "customer"
    }
}
```

#### `GET /api/auth/me`

Retrieves currently logged-in user details.

- **Headers:** `Authorization: Bearer {{authToken}}`
- **Response `200 OK`:**

```json
{
    "success": true,
    "user": {
        "_id": "670d65a88c7fbb9d12345678",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "customer",
        "isActive": true
    }
}
```

---

### 2. User Management (`/api/users`)

#### `GET /api/users/me`

Fetches authenticated user's profile.

- **Headers:** `Authorization: Bearer {{authToken}}`

#### `PUT /api/users/me`

Updates authenticated user's basic profile details.

- **Headers:** `Authorization: Bearer {{authToken}}`, `Content-Type: application/json`
- **Request Body:**

```json
{
    "name": "Jane Mary Doe",
    "phone": "+2348099999999"
}
```

#### `PUT /api/users/me/password`

Changes current password and issues a fresh token.

- **Headers:** `Authorization: Bearer {{authToken}}`, `Content-Type: application/json`
- **Request Body:**

```json
{
    "currentPassword": "Password123",
    "newPassword": "NewPassword456"
}
```

#### `DELETE /api/users/me`

Self-deactivates the user's account (`isActive: false`).

- **Headers:** `Authorization: Bearer {{authToken}}`
- **Response `204 No Content`**

#### `GET /api/users` _(Admin Only)_

Lists all users with optional role filtering and pagination.

- **Headers:** `Authorization: Bearer {{adminToken}}`
- **Query Params:**
    - `role`: Filter by `customer` or `admin`
    - `page`: Page number (default `1`)
    - `limit`: Items per page (default `20`, max `100`)
- **Response `200 OK`:**

```json
{
  "success": true,
  "total": 45,
  "page": 1,
  "pages": 3,
  "users": [ ... ]
}
```

#### `GET /api/users/:id` _(Admin Only)_

Retrieves any user's profile by their ID.

- **Headers:** `Authorization: Bearer {{adminToken}}`

#### `PUT /api/users/:id/role` _(Admin Only)_

Promotes or demotes a user's role.

- **Headers:** `Authorization: Bearer {{adminToken}}`
- **Request Body:**

```json
{
    "role": "admin"
}
```

#### `DELETE /api/users/:id` _(Admin Only)_

Deactivates another user's account without deleting their booking records.

- **Headers:** `Authorization: Bearer {{adminToken}}`

---

### 3. Hotel Management (`/api/hotels`)

#### `POST /api/hotels`

Creates a new hotel record (validated with Zod schema).

- **Request Body:**

```json
{
    "name": "Grand Palace Hotel",
    "description": "A 5-star luxury hotel in Victoria Island with seaside view",
    "address": "123 Seaside Boulevard",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001",
    "amenities": ["Free WiFi", "Swimming Pool", "Gym", "Spa", "Restaurant"],
    "phone": "+2341234567890",
    "email": "concierge@grandpalace.com"
}
```

- **Response `201 Created`:**

```json
{
  "success": true,
  "message": "Hotel created successfully",
  "data": {
    "_id": "670d65a88c7fbb9d12340001",
    "name": "Grand Palace Hotel",
    "city": "Lagos",
    "country": "Nigeria",
    ...
  }
}
```

#### `GET /api/hotels`

Retrieves all registered hotels.

#### `GET /api/hotels/:id`

Retrieves single hotel details by `id`.

#### `PATCH /api/hotels/:id`

Updates hotel information.

- **Request Body:**

```json
{
    "name": "Grand Palace Hotel & Suites",
    "amenities": ["Free WiFi", "Swimming Pool", "Gym", "Spa", "Valet Parking"]
}
```

#### `DELETE /api/hotels/:id`

Deletes a hotel record.

---

### 4. Room Management (`/api/rooms`)

#### `POST /api/rooms`

Adds a room to a hotel's inventory.

- **Request Body:**

```json
{
    "hotel": "670d65a88c7fbb9d12340001",
    "roomNumber": "101-A",
    "roomType": "deluxe",
    "pricePerNight": 150,
    "capacity": 2,
    "status": "available",
    "amenities": ["King Bed", "Sea View Balcony", "AC", "Smart TV", "Mini Bar"],
    "images": ["https://example.com/room101-1.jpg"]
}
```

- **Allowed `roomType` values:** `single`, `double`, `twin`, `deluxe`, `suite`, `family`
- **Allowed `status` values:** `available`, `maintenance`, `inactive`

#### `GET /api/rooms`

Retrieves all rooms with populated hotel details.

#### `GET /api/rooms/:id`

Retrieves a room by ID with hotel information.

#### `PATCH /api/rooms/:id`

Updates room details, pricing, or status.

#### `DELETE /api/rooms/:id`

Deletes a room.

---

### 5. Reservations (`/api/reservations`)

#### `POST /api/reservations`

Initiates a room reservation.

- **Request Body:**

```json
{
    "hotel": "670d65a88c7fbb9d12340001",
    "room": "670d65a88c7fbb9d12340002",
    "checkInDate": "2026-11-10T12:00:00.000Z",
    "checkOutDate": "2026-11-15T10:00:00.000Z",
    "numberOfGuests": 2
}
```

#### `GET /api/reservations`

Lists all reservations.

#### `GET /api/reservations/:id`

Gets a reservation by ID.

#### `PATCH /api/reservations/:id/cancel`

Cancels a reservation.

---

### 6. Payments (`/api/payments`)

#### `POST /api/payments`

Processes a simulated payment for a reservation.

- **Headers:** `Authorization: Bearer {{authToken}}`
- **Request Body:**

```json
{
    "reservationId": "670d65a88c7fbb9d12340003",
    "paymentMethod": "card"
}
```

- **Allowed `paymentMethod` values:** `card`, `bank_transfer`, `cash`, `other`
- **Response `201 Created`:**

```json
{
    "success": true,
    "message": "Simulated payment successful.",
    "data": {
        "_id": "670d65a88c7fbb9d12340004",
        "reservation": "670d65a88c7fbb9d12340003",
        "user": "670d65a88c7fbb9d12345678",
        "amount": 750,
        "paymentMethod": "card",
        "transactionReference": "SIM-7c85ff8a-785c-41c5-849c-f9e42d763eb4",
        "status": "successful",
        "paidAt": "2026-10-14T19:30:00.000Z"
    }
}
```

#### `GET /api/payments/history`

Returns all payments made by the authenticated user.

- **Headers:** `Authorization: Bearer {{authToken}}`

#### `GET /api/payments/:id`

Returns payment details by ID (caller must be the payer or an admin).

- **Headers:** `Authorization: Bearer {{authToken}}`

---

### 7. Availability & Search (`/api/availability`)

#### `GET /api/availability/hotels`

Searches hotels by location or name.

- **Query Params:**
    - `location`: Searches city, country, or street address (case-insensitive)
    - `name`: Matches hotel name regex
- **Example:**

```http
GET /api/availability/hotels?location=Lagos&name=Grand
```

#### `GET /api/availability/rooms`

Searches rooms with pricing, capacity, and real-time date availability filtering.

- **Query Params:**
    - `hotelId`: Filter by specific hotel ID
    - `location`: Filter by hotel city, country, or address
    - `roomType`: `single`, `double`, `twin`, `deluxe`, `suite`, `family`
    - `minPrice`: Minimum price per night
    - `maxPrice`: Maximum price per night
    - `guests`: Number of required guests
    - `checkIn`: Desired check-in date (`YYYY-MM-DD`)
    - `checkOut`: Desired check-out date (`YYYY-MM-DD`)
- **Example:**

```http
GET /api/availability/rooms?location=Lagos&roomType=deluxe&minPrice=50&maxPrice=300&guests=2&checkIn=2026-11-10&checkOut=2026-11-15
```

> [!NOTE]  
> If `checkIn` and `checkOut` are supplied, the query automatically checks active reservations and filters out any rooms that have conflicting bookings during those dates.

---

## 5. Error Handling & Status Codes

The API employs a centralized error handler with uniform JSON responses:

| HTTP Status                 | Meaning          | Typical Scenario                                                |
| :-------------------------- | :--------------- | :-------------------------------------------------------------- |
| **200 OK**                  | Success          | Data retrieved or resource updated                              |
| **201 Created**             | Created          | User, Hotel, Room, or Payment created                           |
| **204 No Content**          | No Content       | Account self-deactivated                                        |
| **400 Bad Request**         | Validation Error | Missing fields, invalid date format, or invalid JSON            |
| **401 Unauthorized**        | Auth Failed      | Missing, malformed, or expired JWT token                        |
| **403 Forbidden**           | Access Denied    | Non-admin trying to access admin route or other user's resource |
| **404 Not Found**           | Not Found        | Route does not exist or resource ID not found                   |
| **409 Conflict**            | Conflict         | Duplicate email or room number already exists in hotel          |
| **500 Server Error**        | Server Error     | Unhandled server or database exception                          |
| **503 Service Unavailable** | Config Missing   | Admin signup attempted without `ADMIN_SIGNUP_KEY`               |

Example Error Response:

```json
{
    "success": false,
    "message": "Route not found: GET /api/unknown"
}
```
