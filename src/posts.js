import express from "express";
import db from "./db.js";

const router = express.Router();

const serializeTags = (tags) => JSON.stringify(tags || []);
const deserializeTags = (tagsStr) => JSON.parse(tagsStr || "[]");

// Create a post
router.post("/", (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO posts (title, content, category, tags, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(
    title,
    content,
    category,
    serializeTags(tags),
    now,
    now
  );
  const post = db
    .prepare("SELECT * FROM posts WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json({ ...post, tags: deserializeTags(post.tags) });
});

// Read all + filter
router.get("/", (req, res) => {
  const { term } = req.query;
  let posts;

  if (term) {
    const like = `%${term}%`;
    posts = db
      .prepare(
        `
        SELECT * FROM posts
        WHERE title LIKE ? OR content LIKE ? OR category LIKE ?
        `
      )
      .all(like, like, like);
  } else {
    posts = db.prepare("SELECT * FROM posts").all();
  }

  res.json(posts.map((p) => ({ ...p, tags: deserializeTags(p.tags) })));
});

// Read one
router.get("/:id", (req, res) => {
  const post = db
    .prepare(`SELECT * FROM posts WHERE id = ?`)
    .get(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ ...post, tags: deserializeTags(post.tags) });
});

// Update
router.put("/:id", (req, res) => {
  const { title, content, category, tags } = req.body;
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `
    UPDATE posts 
    SET title = ?, content = ?, category = ?, tags = ?, updatedAt = ?
    WHERE id = ?
    RETURNING *
    `
    )
    .run(title, content, category, serializeTags(tags), now, req.params.id);

  if (!result) return res.status(404).json({ error: "Post not found" });
  res.json({ ...result, tags: deserializeTags(result.tags) });
});

// Delete
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM posts WHERE id = ?")
    .run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "Post not found" });
  res.status(204).end();
});

export default router;
