import Database from "better-sqlite3";

const dbFile = process.env.NODE_ENV === "test" ? ":memory:" : "blog.db";
const db = new Database(dbFile);

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
    )
`
).run();

export default db;
