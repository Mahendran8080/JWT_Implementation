# `middleware/auth.js`

> **Location**: `middleware/auth.js`  
> **Purpose**: Central JWT‑based authentication middleware for Express routes.

---

## 1. Overview

This module implements a reusable Express middleware that validates JSON Web Tokens (JWTs) sent in the request headers.  
When a request reaches a protected route, the middleware:

1. Extracts the token from the `Authorization` header (or a custom header named `token`).
2. Verifies the token using a secret stored in the environment.
3. Attaches the decoded payload to `req.user` for downstream handlers.
4. Blocks access if the token is missing or invalid.

By centralizing authentication logic here, the rest of the application can rely on `req.user` to identify the authenticated user without re‑implementing token checks.

---

## 2. Detailed Breakdown

| Section | Description |
|---------|-------------|
| **Imports** | ```js\nconst jwt = require('jsonwebtoken');\nconst dotenv = require('dotenv');\n```<br>Loads the JWT library and dotenv for environment variables. |
| **Environment Setup** | ```js\ndotenv.config();\n```<br>Loads variables from a `.env` file into `process.env`. |
| **Middleware Function** | ```js\nasync function middleware(req, res, next) { ... }\n```<br>Declared as `async` to allow future async operations (e.g., DB look‑ups). |
| **Token Extraction** | ```js\nconst { token } = req.headers;\n```<br>Expects a header named `token`. (Common practice is `Authorization: Bearer <token>`, but this file uses a plain header.) |
| **Missing Token Check** | ```js\nif (!token) {\n  return res.json({ success: false, message: \"Not authorized login\" });\n}\n```<br>Returns a JSON error if no token is provided. |
| **Token Verification** | ```js\nconst token_decode = jwt.verify(token, process.env.JWT_SECRET);\n```\n- `process.env.JWT_SECRET` must be defined in the environment.<br>- `jwt.verify` throws on invalid/expired tokens. |
| **User Attachment** | ```js\nreq.user = token_decode;\n```\nThe decoded payload (typically `{ id, email, name, ... }`) is stored on the request object for downstream handlers. |
| **Error Handling** | ```js\ncatch (error) {\n  console.log(error.message);\n}\n```<br>Logs verification errors but does **not** send a response; the request will hang unless `next()` is called elsewhere. (Consider adding a `res.status(401).json(...)`.) |
| **Export** | ```js\nmodule.exports = middleware;\n``` |

### Configuration

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET` | Secret key used to sign and verify JWTs. | `JWT_SECRET=superSecretKey123` |

> **Tip**: Keep `JWT_SECRET` out of source control and use a secure vault or CI secrets manager in production.

---

## 3. Integrations

| Component | Interaction |
|-----------|-------------|
| **Express Routes** | Import and use as `app.use('/protected', middleware, handler)` or `router.use(middleware)`. |
| **User Registration/Login** | After successful login, the server generates a JWT (e.g., `jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1h' })`) and sends it back to the client. |
| **Database Models** | Downstream route handlers can query the database using `req.user.id` to fetch user-specific data. |
| **Other Middlewares** | Can be stacked with CORS, rate limiting, etc., before or after this auth middleware. |
| **Testing** | Unit tests can mock `req.headers.token` and `process.env.JWT_SECRET` to validate behavior. |

---

## 4. Usage Example

```js
// routes/protected.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/profile', auth, (req, res) => {
  // req.user is available here
  res.json({ success: true, user: req.user });
});

module.exports = router;
```

---

## 5. Recommendations & Best Practices

1. **Header Naming**: Adopt the standard `Authorization: Bearer <token>` header and parse it accordingly.  
2. **Error Response**: In the `catch` block, send a 401 response to avoid hanging requests.  
3. **Token Expiry**: Handle `TokenExpiredError` separately to inform clients to refresh tokens.  
4. **Async Support**: If you need to fetch additional user data (e.g., from Redis), keep the middleware `async` and `await` those calls before `next()`.  
5. **Logging**: Replace `console.log` with a structured logger (e.g., Winston) for production environments.

---

## 6. Summary

`middleware/auth.js` is a lightweight, reusable JWT authentication layer that:

- Validates tokens on each request.
- Exposes user data via `req.user`.
- Integrates seamlessly with Express routes and other middleware.

By centralizing this logic, the application maintains a clean separation of concerns and ensures consistent authentication across all protected endpoints.