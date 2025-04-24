# ShelfShare API

ShelfShare is a RESTful API for managing a book-store platform. It includes features for user authentication, book management, order processing, and more.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Book Management](#book-management)
  - [Order Management](#order-management)
  - [Favorites](#favorites)
  - [Admin Statistics](#admin-statistics)
- [Error Handling](#error-handling)
- [Dependencies](#dependencies)

---

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Alshlqany/shelfShare-v2.git
   cd shelfShare-v2
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:
   ```bash
   npm run server
   ```

The API will run on `http://localhost:5000` by default.

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URL=<your-mongodb-connection-string>
CLOUD_NAME=<your-cloudinary-name>
CLOUD_API_KEY=<your-cloudinary-api-key>
CLOUD_API_SECRET=<your-cloudinary-secret>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>
JWT_SECRET=<your-jwt-secret>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
Frontend_URL=http://localhost:5000
```

---

## API Endpoints

### Authentication

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| POST   | `/api/auth/signup`          | Register a new user               |
| POST   | `/api/auth/login`           | Login and get a JWT token         |
| POST   | `/api/auth/verify-otp`      | Verify email using OTP            |
| POST   | `/api/auth/resend-otp`      | Resend OTP for email verification |
| POST   | `/api/auth/forget-password` | Request password reset OTP        |
| POST   | `/api/auth/reset-password`  | Reset password using OTP          |

---

### User Management

| Method | Endpoint                 | Description                       |
| ------ | ------------------------ | --------------------------------- |
| GET    | `/api/user/me`           | Get the current user's profile    |
| PUT    | `/api/user/`             | Update the current user's profile |
| GET    | `/api/user/`             | Get all users (Admin only)        |
| PUT    | `/api/user/role/:userId` | Change a user's role (Admin only) |

---

### Book Management

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | `/api/book/`               | Get all books               |
| GET    | `/api/book/:bookId`        | Get a book by ID            |
| POST   | `/api/book/`               | Add a new book (Admin only) |
| PATCH  | `/api/book/:id`            | Update a book (Admin only)  |
| DELETE | `/api/book/:id`            | Delete a book (Admin only)  |
| POST   | `/api/book/review/:bookId` | Add a review for a book     |

---

### Order Management

| Method | Endpoint              | Description                             |
| ------ | --------------------- | --------------------------------------- |
| POST   | `/api/order/checkout` | Create a Stripe checkout session        |
| GET    | `/api/order/`         | Get all orders (Admin or user-specific) |
| GET    | `/api/order/:orderId` | Get an order by ID                      |

---

### Favorites

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/api/favorite/`        | Get the user's favorite books        |
| POST   | `/api/favorite/`        | Add a book to the favorite list      |
| DELETE | `/api/favorite/:bookId` | Remove a book from the favorite list |

---

### Admin Statistics

| Method | Endpoint      | Description                       |
| ------ | ------------- | --------------------------------- |
| GET    | `/api/stats/` | Get admin statistics (Admin only) |

---

## Error Handling

All endpoints return standard HTTP status codes to indicate success or failure. Errors are returned in the following format:

```json
{
  "message": "Error description"
}
```

---

## Dependencies

The project uses the following dependencies:

- **Express**: Web framework
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Cloudinary**: Image storage
- **Stripe**: Payment processing
- **Nodemailer**: Email sending
- **Validator**: Input validation
- **Multer**: File uploads

For a full list, see [`package.json`](./package.json).
