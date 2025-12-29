# `middleware/auth.js`

> **Location**: `middleware/auth.js`  
> **Purpose**: Central JWT‑based authentication middleware for Express routes.

---

## 1. Overview

This module implements a reusable Express middleware that validates JSON Web Tokens (JWTs) sent in HTTP request headers. Once a token is verified, the decoded payload is attached to `req.user`, allowing downstream route handlers to access authenticated user information without re‑parsing the token.

The middleware is a key part of the **authentication layer** in the application, ensuring that protected endpoints can only be accessed by clients presenting a valid token.

---

## 2. Detailed Breakdown

| Section | Description |
|---------|-------------|
| **Imports** | ```js<br>const jwt = require('jsonwebtoken');<br>const dotenv = require('dotenv');<br>dotenv.config();<br>```<br>Loads the `jsonwebtoken` library for token verification and `dotenv` for environment variable resolution. |
| **Function** | `async function middleware(req, res, next)` – Express middleware signature. |
| **Token Extraction** | ```js<br>const { token } = req.headers;<br>```<br>Expects the JWT to be present in the request headers under the key `token`. (Typical usage: `Authorization: Bearer <token>` could be a more conventional approach.) |
| **Missing Token Check** | ```js<br>if (!token) { return res.json({ success: false, message: "Not authorized login" }); }<br>```<br>Returns a JSON error if no token is provided. |
| **Token Verification** | ```js<br>const token_decode = jwt.verify(token, process.env.JWT_SECRET);<br>```<br>Decodes the token using the secret stored in `JWT_SECRET`. The decoded payload (usually containing user identifiers such as `id`, `email`, etc.) is stored in `req.user`. |
| **Error Handling** | ```js<br>catch(error) { console.log(error.message); }<br>```<br>Logs verification errors but **does not** send an HTTP error response. (A potential improvement: return a 401/403 status.) |
| **Next Hook** | `next();` – Passes control to the next middleware or route handler once authentication succeeds. |
| **Export** | `module.exports = middleware;` – Makes the function available for import elsewhere. |

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET` | Secret key used to sign and verify JWTs. | `JWT_SECRET=superSecretKey123` |

---

## 3. Integrations

| Component | Interaction |
|-----------|-------------|
| **Express Routes** | Import and use as `app.use('/protected', authMiddleware, protectedHandler);` or on a per‑route basis. |
| **User Service** | After successful login, the server generates a JWT containing user details (e.g., `id`, `email`). This token is sent to the client and later validated by this middleware. |
| **Database** | Not directly accessed; relies on the token payload to identify the user. |
| **Error Handling Middleware** | If the middleware fails to call `next()` (e.g., due to an error), the request will hang unless an error response is sent. Consider adding `return res.status(401).json({ success: false, message: 'Invalid token' });` in the catch block. |

### Usage Example

```js
// routes/protected.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/profile', auth, (req, res) => {
  // req.user is populated by the middleware
  res.json({ success: true, user: req.user });
});

module.exports = router;
```

### Typical Request

```http
GET /profile HTTP/1.1
Host: api.example.com
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Recommendations

1. **Header Convention** – Use `Authorization: Bearer <token>` and parse accordingly for better compatibility with OAuth2 clients.
2. **Error Response** – In the `catch` block, return a 401 status to inform the client of authentication failure.
3. **Token Expiry** – Consider checking `exp` claim or using `jwt.verify` options to enforce token expiration.
4. **Logging** – Replace `console.log` with a structured logger for production environments.

---

### TL;DR

`middleware/auth.js` is a lightweight Express middleware that:

1. Pulls a JWT from the request header.
2. Validates it against `JWT_SECRET`.
3. Attaches the decoded payload to `req.user`.
4. Proceeds to the next handler or returns a JSON error if the token is missing.

It is the gatekeeper for all routes that require authenticated access.