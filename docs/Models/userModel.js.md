# `userModel.js`

> **Location:** `Models/userModel.js`  
> **Purpose:** Defines the Mongoose schema and model for user documents in the MongoDB database.

---

## 1. Overview

This file is a **data access layer** component that encapsulates the structure and validation rules for user records. It is part of the **Model** layer in the MVC (Model‑View‑Controller) architecture, providing a single source of truth for user data and enabling the rest of the application to interact with MongoDB through a strongly‑typed interface.

Key responsibilities:

- **Schema definition** – Describes the shape of a user document.
- **Validation** – Enforces required fields and basic string formatting.
- **Model creation** – Exposes a Mongoose model (`userModel`) that can be imported elsewhere to perform CRUD operations.

---

## 2. Detailed Breakdown

```js
const mongoose = require('mongoose');
```
*Imports the Mongoose library, which is the ODM (Object‑Document Mapper) used to communicate with MongoDB.*

```js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  }
});
```

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `name` | `String` | `required: true`, `trim: true` | Stores the user’s display name. |
| `email` | `String` | `required: true`, `trim: true` | Should be unique in a production system (not enforced here). |
| `password` | `String` | `required: true`, `trim: true` | Plain text placeholder – in a real app this should be hashed before persistence. |

*The schema is intentionally minimal; additional fields (e.g., `role`, `createdAt`) can be added as the application evolves.*

```js
const userModel = new mongoose.model('user', userSchema);
```

*Creates a Mongoose model named **`user`** based on `userSchema`.  
The model is the primary interface for querying, inserting, updating, and deleting user documents.*

```js
module.exports = userModel;
```

*Exports the model so that other modules can import it via `require('./Models/userModel')`.*

---

## 3. Integrations

| Layer | Interaction | How it’s used |
|-------|-------------|---------------|
| **Controller / Service** | `userModel` is imported to perform database operations. | `const User = require('../Models/userModel');`<br>`User.findOne({ email })`<br>`User.create({ name, email, password })` |
| **Routes** | Controllers call the model to handle HTTP requests. | `POST /api/users` → create a new user. |
| **Middleware** | Validation or authentication middleware may reference the schema for consistency. | `userSchema.path('email').validate(...)` |
| **Testing** | Unit tests import the model to seed or clean the test database. | `await User.deleteMany({})` before each test. |

> **Security Note:**  
> The current implementation stores passwords as plain strings. In a production environment, integrate a hashing library (e.g., `bcrypt`) in a pre‑save hook or in the service layer before persisting the password.

---

## 4. Suggested Enhancements

1. **Unique Email Constraint**  
   ```js
   email: { type: String, required: true, trim: true, unique: true }
   ```
2. **Email Validation** – Use a regex or Mongoose validator to enforce proper email format.
3. **Password Hashing** – Add a `pre('save')` hook to hash passwords automatically.
4. **Timestamps** – Enable `timestamps: true` in the schema options to track `createdAt` and `updatedAt`.
5. **Indexing** – Add indexes for fields frequently queried (e.g., `email`).

---

### Quick Reference

```js
// Importing the model
const User = require('./Models/userModel');

// Creating a user
const newUser = await User.create({
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret123'
});

// Querying a user
const user = await User.findOne({ email: 'alice@example.com' });
```

---