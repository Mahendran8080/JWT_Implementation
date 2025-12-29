# `Models/userModel.js`

> **Location:** `Models/userModel.js`  
> **Purpose:** Defines the Mongoose schema and model for user documents in the MongoDB database.

---

## 1. Overview

This file is a **data access layer** component that encapsulates the structure and validation rules for user records. It is part of the **Model** layer in a typical MVC (Model‑View‑Controller) architecture. By centralizing the schema definition here, the rest of the application can:

- **Create, read, update, and delete** user documents via the exported `userModel`.
- **Enforce data integrity** (e.g., required fields, trimming whitespace).
- **Maintain consistency** across all modules that interact with user data.

---

## 2. Detailed Breakdown

```js
const mongoose = require('mongoose');
```
- Imports the Mongoose library, which provides an ODM (Object Data Modeling) interface for MongoDB.

### Schema Definition

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

| Field | Type   | Constraints | Notes |
|-------|--------|-------------|-------|
| `name` | `String` | `required: true`, `trim: true` | Stores the user’s display name. |
| `email` | `String` | `required: true`, `trim: true` | Should be unique in a production system (not enforced here). |
| `password` | `String` | `required: true`, `trim: true` | Plain text placeholder; in a real app this should be hashed before persistence. |

- **`trim: true`** removes leading and trailing whitespace automatically.
- No additional validation (e.g., email format, password strength) is included; those are typically handled elsewhere (e.g., in a controller or a pre‑save hook).

### Model Creation

```js
const userModel = new mongoose.model('user', userSchema);
```

- Instantiates a Mongoose model named **`user`** based on `userSchema`.  
- The model is tied to the `users` collection in MongoDB (Mongoose pluralizes the name).

### Export

```js
module.exports = userModel;
```

- Exposes the model for import in other parts of the application (controllers, services, etc.).

---

## 3. Integrations

| Layer | Interaction | Example |
|-------|-------------|---------|
| **Controllers** | `userModel` is imported to handle HTTP requests (e.g., `POST /users`, `GET /users/:id`). | `const User = require('../Models/userModel');` |
| **Services** | Business logic may use `userModel` to query or manipulate user data. | `User.findById(id).exec()` |
| **Routes** | Route handlers call controller functions that in turn use `userModel`. | `router.post('/register', userController.register);` |
| **Middleware** | Authentication middleware may query `userModel` to verify credentials. | `User.findOne({ email })` |
| **Database Connection** | The model relies on an active Mongoose connection established elsewhere (e.g., `config/db.js`). | `mongoose.connect(process.env.MONGO_URI)` |

> **Tip:** In a larger codebase, consider adding indexes (e.g., `email: { unique: true }`) and pre‑save hooks for password hashing to enhance security and performance.

---

### File Summary

- **Purpose:** Define and export a Mongoose model for user documents.
- **Key Features:** Required fields, whitespace trimming, basic schema structure.
- **Usage:** Imported wherever user data operations are needed.

---