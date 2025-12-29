# `configDB/config.js`

> **Purpose** – Centralizes the MongoDB connection logic for the application.  
> **Location** – `configDB/config.js` (root of the repository’s configuration folder).

---

## 1. Overview

This module is responsible for establishing a connection to a MongoDB instance using **Mongoose**.  
It reads the connection string from the environment (`MONGO_URI`) and exposes a single function, `configDB`, that can be imported and invoked from anywhere in the application (typically during startup).  

By isolating the database configuration in one file, the project gains:

- **Single source of truth** for the DB connection logic.
- **Easier testing** – the function can be mocked or stubbed.
- **Cleaner startup code** – the main entry point only needs to call `configDB()`.

---

## 2. Detailed Breakdown

```js
const mongoose = require('mongoose');
const dotenv   = require('dotenv');

dotenv.config();          // Load .env variables into process.env

function configDB() {
    mongoose.connect(process.env.MONGO_URI)   // 1️⃣ Connect to MongoDB
        .then(() => {
            console.log("Connected to Mongo db");   // 2️⃣ Success log
        })
        .catch((error) => {
            console.log(error.message);             // 3️⃣ Error handling
        });
}

module.exports = configDB;
```

| Section | Purpose | Key Points |
|---------|---------|------------|
| **Imports** | `mongoose` – ODM for MongoDB; `dotenv` – loads environment variables from a `.env` file. | `dotenv.config()` must be called before accessing `process.env`. |
| **`configDB()`** | Initiates a connection to MongoDB. | - Uses `process.env.MONGO_URI` as the connection string.<br>- Returns a promise implicitly via `mongoose.connect`. |
| **Success callback** | Logs a confirmation message. | Could be expanded to emit an event or set a flag in a more complex app. |
| **Error callback** | Logs the error message. | In production, you might want to exit the process or retry. |
| **Export** | Exposes the function for external use. | `module.exports = configDB;` – CommonJS export. |

### Environment Variable

- **`MONGO_URI`** – Must be defined in a `.env` file or the deployment environment.  
  Example: `MONGO_URI=mongodb://localhost:27017/myapp`.

### Connection Options

The current implementation uses Mongoose’s default options. If you need to customize options (e.g., `useNewUrlParser`, `useUnifiedTopology`), you can pass them as a second argument to `mongoose.connect`.

```js
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

---

## 3. Integrations

| Component | Interaction | Notes |
|-----------|-------------|-------|
| **Application bootstrap** (`index.js`, `app.js`, etc.) | `const configDB = require('./configDB/config'); configDB();` | Ensures the DB is connected before starting the server. |
| **Models** (`models/*.js`) | Import Mongoose after `configDB()` has run. | Models rely on the global Mongoose connection; calling `configDB()` first guarantees the connection is ready. |
| **Environment** | Uses `dotenv` to load `.env` at runtime. | If the project uses Docker or a cloud provider, the environment variable can be injected via the container or service configuration. |
| **Error handling** | The catch block logs errors; you might hook into a global error handler or use `process.on('unhandledRejection')`. | For production, consider using a logger (e.g., Winston) instead of `console.log`. |

### Typical Usage Flow

1. **Start the application** – `node server.js` or `npm start`.
2. **`configDB()` is invoked** – establishes a connection to MongoDB.
3. **Models are defined** – they use the same Mongoose instance.
4. **Routes and services** – perform CRUD operations via the models.
5. **Graceful shutdown** – `mongoose.connection.close()` can be called on process exit.

---

## 4. Recommendations

- **Add connection options** for better stability (e.g., `useNewUrlParser`, `useUnifiedTopology`).
- **Return the promise** from `configDB()` so callers can await the connection before proceeding.
- **Centralize logging** – replace `console.log` with a structured logger.
- **Handle connection errors** more robustly (retry logic, exit on failure).

---

### Example Refactor

```js
// configDB/config.js
const mongoose = require('mongoose');
const dotenv   = require('dotenv');

dotenv.config();

async function configDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  }
}

module.exports = configDB;
```

This version uses `async/await`, returns a promise, and exits the process on failure, which is often desirable in production environments.