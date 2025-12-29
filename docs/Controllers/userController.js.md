# `userController.js`

> **Location**: `Controllers/userController.js`  
> **Purpose**: Handles user authentication (sign‑up & log‑in) for the API.

---

## 1. Overview

`userController.js` is a **controller layer** in a typical **MVC** architecture.  
It exposes two asynchronous functions:

| Function | Responsibility |
|----------|----------------|
| `signUp` | Registers a new user, hashes the password, and persists the user to MongoDB. |
| `logIn` | Authenticates an existing user, verifies the password, and issues a JWT. |

These functions are exported and wired to Express routes (e.g., `POST /api/auth/signup`, `POST /api/auth/login`). They rely on:

- **Mongoose** (`userModel`) for database interaction.
- **bcrypt** for secure password hashing.
- **jsonwebtoken** for token generation.
- **dotenv** for environment‑specific configuration.

---

## 2. Detailed Breakdown

### 2.1 Imports & Configuration

```js
const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();   // Loads .env variables
```

| Variable | Source | Typical Value | Usage |
|----------|--------|---------------|-------|
| `process.env.JWT_SECRET` | `.env` | `superSecretKey` | Secret key for signing JWTs. |
| `process.env.JWT_EXPIRES_IN` | `.env` | `1h` | Token expiration time. |

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
3. If found, **compare** the supplied password with the stored hash.
4. On success, **sign a JWT** containing the user’s `_id` and `email`.
5. Return a JSON response with `success`, `message`, and optionally the `token`.

> **Note**: The `name` field is unused in this function; it can be removed to avoid confusion.

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

1. **Extract** `name`, `email`, `password`.
2. **Check** if a user with the same email already exists.
3. If not, **hash** the password (`saltRounds = 5`).
4. **Create** a new `userModel` instance and persist it.
5. Respond with a success message.

> **Security Tip**: A higher `saltRounds` value (e.g., 10–12) is recommended for production.

### 2.4 Export

```js
module.exports = { signUp, logIn };
```

Both functions are exported as part of an object, ready to be imported in route definitions.

---

## 3. Integrations

| Layer | Interaction | Details |
|-------|-------------|---------|
| **Routes** | `POST /signup` → `signUp`<br>`POST /login` → `logIn` | Express route handlers import these functions and pass `req`/`res`. |
| **Model** | `userModel` | Mongoose schema for users; provides `findOne`, `save`, etc. |
| **Auth Middleware** | JWT verification | Other protected routes use the token issued by `logIn` to authenticate requests. |
| **Environment** | `.env` | `JWT_SECRET`, `JWT_EXPIRES_IN` are consumed here. |
| **Logging** | `console.log(error)` | Errors are logged to the console; consider using a structured logger in production. |

---

## 4. Usage Example

```js
// routes/auth.js
const express = require('express');
const router = express.Router();
const { signUp, logIn } = require('../Controllers/userController');

router.post('/signup', signUp);
router.post('/login', logIn);

module.exports = router;
```

```js
// app.js
const express = require('express');
const authRoutes = require('./routes/auth');
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Server running'));
```

---

## 5. Recommendations

- **Error Handling**: Return proper HTTP status codes (`400`, `401`, `500`) instead of always `200`.
- **Password Strength**: Validate password complexity before hashing.
- **Environment Validation**: Use a library like `joi` or `dotenv-safe` to ensure required env vars are set.
- **Logging**: Replace `console.log` with a structured logger (e.g., `winston`).

---

**Author**: AI Documentation Product  
**Last Updated**: 2025‑12‑29

---