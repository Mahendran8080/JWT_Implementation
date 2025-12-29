# `userController.js`

> **Location:** `Controllers/userController.js`  
> **Purpose:** Handles user authentication (sign‑up & login) for the application.

---

## 1. Overview

The `userController.js` file implements the core authentication logic for the backend API. It exposes two asynchronous functions:

| Function | Responsibility |
|----------|----------------|
| `signUp` | Registers a new user, hashes the password, and persists the user to MongoDB. |
| `logIn` | Authenticates an existing user, verifies the password, and issues a JWT. |

These functions are exported and used by the routing layer (e.g., `routes/userRoutes.js`) to respond to HTTP requests.

---

## 2. Detailed Breakdown

### 2.1 Imports & Configuration

```js
const userModel = require('../Models/userModel');
const bcrypt   = require('bcrypt');
const dotenv   = require('dotenv');
const jwt      = require('jsonwebtoken');

dotenv.config();          // Loads .env variables
```

| Variable | Description |
|----------|-------------|
| `userModel` | Mongoose model representing the `users` collection. |
| `bcrypt` | Library for hashing and comparing passwords. |
| `dotenv` | Loads environment variables from `.env`. |
| `jwt` | JSON Web Token library for generating auth tokens. |

#### Environment Variables

| Variable | Expected Value | Role |
|----------|----------------|------|
| `JWT_SECRET` | Secret key string | Used to sign JWTs. |
| `JWT_EXPIRES_IN` | Time string (e.g., `"1h"`) | Token expiration duration. |

### 2.2 `logIn` Function

```js
const logIn = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await userModel.findOne({ email });

    if (exists) {
      const isMatch = await bcrypt.compare(password, exists.password);
      if (isMatch) {
        const token = jwt.sign(
          { id: exists._id, email: exists.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        return res.json({ success: true, message: "user logged in", token });
      } else {
        return res.json({ success: false, message: "Password is incorrect" });
      }
    } else {
      return res.json({ success: false, message: "User does not exist please create a new one" });
    }
  } catch (error) {
    console.log(error);
  }
};
```

#### Flow

1. **Extract credentials** from `req.body`.
2. **Lookup** the user by `email`.
3. If the user exists:
   - **Compare** the supplied password with the stored hash.
   - On success, **generate a JWT** containing the user’s `_id` and `email`.
   - Return a JSON response with `success: true`, a message, and the token.
4. If the password is wrong or the user doesn’t exist, return an appropriate error message.
5. Errors are logged to the console (no HTTP error response is sent – see *Improvement* section).

### 2.3 `signUp` Function

```js
const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return res.json({ success: true, message: "new user created" });
  } catch (error) {
    console.log(error);
  }
};
```

#### Flow

1. **Extract** `name`, `email`, `password` from the request body.
2. **Check** if a user with the same email already exists.
3. If not, **hash** the password using `bcrypt` with a salt rounds value of `5`.
4. **Create** a new `userModel` instance and persist it.
5. Return a success JSON response.

### 2.4 Export

```js
module.exports = { signUp, logIn };
```

Both functions are exported as part of an object for easy import in route definitions.

---

## 3. Integrations

| Layer | Interaction |
|-------|-------------|
| **Routes** | `userRoutes.js` (or similar) imports `{ signUp, logIn }` and maps them to HTTP endpoints (`POST /signup`, `POST /login`). |
| **Database** | Uses `userModel` (Mongoose) to query and persist user documents. |
| **Auth Middleware** | The JWT returned by `logIn` is typically stored on the client side (e.g., in `localStorage`) and sent in the `Authorization` header for protected routes. |
| **Environment** | Relies on `.env` variables for JWT secret and expiration. |
| **Logging** | Errors are logged to the console; in production, this could be replaced with a structured logger. |

---

## 4. Suggested Improvements

| Issue | Recommendation |
|-------|----------------|
| **Error handling** | Return proper HTTP status codes (`400`, `401`, `500`) and error messages instead of just logging. |
| **Password salt rounds** | Use a higher salt rounds value (e.g., `10` or `12`) for better security. |
| **Input validation** | Validate `email` format and password strength before processing. |
| **Response consistency** | Use a unified response schema and include `status` codes. |
| **Async error handling** | Wrap the controller logic in a try/catch that sends a 500 response on unexpected errors. |
| **Environment safety** | Ensure `JWT_SECRET` and `JWT_EXPIRES_IN` are defined; otherwise, throw an initialization error. |

---

## 5. Usage Example

```js
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { signUp, logIn } = require('../Controllers/userController');

router.post('/signup', signUp);
router.post('/login', logIn);

module.exports = router;
```

```bash
# Sign up
POST /signup
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "SuperSecret123"
}

# Login
POST /login
{
  "email": "alice@example.com",
  "password": "SuperSecret123"
}
```

The login response will include a JWT:

```json
{
  "success": true,
  "message": "user logged in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

Use this token in subsequent requests:

```
Authorization: Bearer <token>
```

---

### TL;DR

`userController.js` is the authentication backbone of the application, providing secure sign‑up and login endpoints that interact with MongoDB, hash passwords, and issue JWTs for stateless session management.