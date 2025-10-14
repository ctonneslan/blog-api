import Database from "better-sqlite3";

const dbFile = process.env.NODE_ENV === "test" ? ":memory:" : "blog.db";
const db = new Database(dbFile);

db.pragma("foreign_keys = ON");

// --- Create categories table ---
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`
).run();

// --- Create posts table ---
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER,
    tags TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`
).run();

export default db;
