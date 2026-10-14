# Hotel Reservation API

A REST API for managing hotel listings, rooms, availability, reservations, customer accounts, and simulated payments. The service is built with Node.js, Express, and MongoDB.

## Features

- Customer registration, login, and JWT-based authentication
- Admin account registration protected by a configurable signup key
- Hotel and room management
- Hotel and room search, including date-based availability checks
- Reservation creation, listing, and cancellation
- Simulated payment records and payment history
- User profile and account management

## Technology

- Node.js with ES modules
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens and bcryptjs
- Zod validation, Helmet, and CORS

## Requirements

- Node.js (a current LTS release is recommended)
- npm
- A MongoDB database, local or hosted

## Setup

1. Clone the repository and open the project directory:

   ```bash
   git clone https://github.com/Faith2Felix/hotel-reservation-api.git
   cd hotel-reservation-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root. Start with the provided `.env.example` and set values for your environment:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/hotel-reservation
   JWT_SECRET=replace-with-a-long-random-secret
   ADMIN_SIGNUP_KEY=replace-with-a-private-admin-signup-key
   # JWT_EXPIRES_IN=7d
   ```

   `PORT`, `MONGO_URI`, and `JWT_SECRET` are used by the application. `ADMIN_SIGNUP_KEY` is required to enable admin registration. `JWT_EXPIRES_IN` is optional and defaults to `7d`.

4. Run the development server:

   ```bash
   npm run dev
   ```

   Or start it without the file watcher:

   ```bash
   npm start
   ```

The API listens on port `5000` by default, or the port set in `PORT`. The root route (`GET /`) returns a simple status message.

## API Overview

Unless noted, routes below are mounted under the indicated prefix. Protected endpoints require the token returned by registration or login:

```http
Authorization: Bearer <token>
```

| Prefix              | Endpoints                                                                                     | Purpose                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/auth`         | `POST /register`, `POST /register-admin`, `POST /login`, `GET /me`                            | Create customer/admin accounts, sign in, and retrieve the authenticated account. `/me` requires a token; admin registration also requires `ADMIN_SIGNUP_KEY`. |
| `/api/users`        | `GET/PUT/DELETE /me`, `PUT /me/password`, `GET /`, `GET /:id`, `PUT /:id/role`, `DELETE /:id` | Manage profiles and accounts. Profile routes require authentication; user administration routes require the admin role.                                       |
| `/api/hotels`       | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`                                    | List, view, create, update, and delete hotels.                                                                                                                |
| `/api/rooms`        | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`                                    | List, view, create, update, and delete rooms.                                                                                                                 |
| `/api/availability` | `GET /hotels`, `GET /rooms`                                                                   | Search hotels and rooms; room search accepts optional filters and dates.                                                                                      |
| `/api/reservations` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id/cancel`                                            | Create and manage reservations. These routes require authentication.                                                                                          |
| `/api/payments`     | `POST /`, `GET /history`, `GET /:id`                                                          | Create a simulated payment and view payment records. These routes require authentication.                                                                     |

### Example requests

Register a customer:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Jamie Example",
  "email": "jamie@example.com",
  "password": "SecurePass123",
  "phone": "+1 555 0100"
}
```

Passwords must be at least eight characters and contain a letter and a number. The response includes an authentication token.

Search for rooms in a date range:

```http
GET /api/availability/rooms?location=Lagos&guests=2&checkIn=2027-03-10&checkOut=2027-03-13
```

Create a reservation with a valid hotel and room ID, using the token from login or registration:

```http
POST /api/reservations
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "hotel": "<hotel-id>",
  "room": "<room-id>",
  "checkInDate": "2027-03-10",
  "checkOutDate": "2027-03-13",
  "numberOfGuests": 2
}
```

Room searches support `hotelId`, `location`, `roomType`, `minPrice`, `maxPrice`, `guests`, `checkIn`, and `checkOut` query parameters. Hotel searches support `location` and `name`.

## Project Structure

```text
.
├── app.js
├── src/
│   ├── config/         # Database connection
│   ├── controllers/    # Request handling and business logic
│   ├── middlewares/    # Authentication, validation, and error handling
│   ├── models/         # Mongoose data models
│   ├── routes/         # API route definitions
│   └── validations/    # Request schemas
├── .env.example
└── package.json
```

## Project Status

The API is under active development. Payment handling is simulated and does not process real transactions. The `npm test` script is currently a placeholder and does not run an automated test suite.
