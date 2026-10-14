# Hotel Reservation API

A RESTful backend API for hotel reservation and booking management.

## Project Overview

This project is a backend API that allows users to interact with a hotel reservation system. The API will provide functionality for managing users, hotels, rooms, room availability, reservations and other related hotel operations.

## Technologies

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* dotenv
* CORS

## Project Structure

```text
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── app.js
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Create a `.env` file in the root directory and add the required environment variables.

### 4. Start the development server

```bash
npm run dev
```

## 🚀 API Documentation & Postman Collection

- 📘 **Full API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint references, schemas, and error codes.
- 📮 **Postman Collection**: Import [hotel-reservation-api.postman_collection.json](./hotel-reservation-api.postman_collection.json) directly into Postman to test all routes with pre-configured variables and auto-token management.

## Project Status

✅ Merged and active. Fully functional RESTful API.
