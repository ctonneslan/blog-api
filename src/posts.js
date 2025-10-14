import express from "express";
import db from "./db.js";

const router = express.Router();

// --- Utilities ---
const serializeTags = (tags) => JSON.stringify(tags || []);
const deserializeTags = (tagsStr) => {
  try {
    return JSON.parse(tagsStr || "[]");
  } catch {
    return [];
  }
};

// --- Create a new post ---
router.post("/", (req, res) => {
  try {
    const { title, content, category_id, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO posts (title, content, category_id, tags, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      content,
      category_id || null,
      serializeTags(tags),
      now,
      now
    );

    const post = db
      .prepare(
        `
        SELECT posts.*, categories.name AS category
        FROM posts
        LEFT JOIN categories ON posts.category_id = categories.id
        WHERE posts.id = ?
      `
      )
      .get(result.lastInsertRowid);

    res.status(201).json({ ...post, tags: deserializeTags(post.tags) });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// --- Get all posts or filter by term ---
router.get("/", (req, res) => {
  try {
    const { term } = req.query;
    let posts;

    if (term) {
      const like = `%${term}%`;
      posts = db
        .prepare(
          `
          SELECT posts.*, categories.name AS category
          FROM posts
          LEFT JOIN categories ON posts.category_id = categories.id
          WHERE posts.title LIKE ?
             OR posts.content LIKE ?
             OR categories.name LIKE ?
        `
        )
        .all(like, like, like);
    } else {
      posts = db
        .prepare(
          `
          SELECT posts.*, categories.name AS category
          FROM posts
          LEFT JOIN categories ON posts.category_id = categories.id
        `
        )
        .all();
    }

    res.json(posts.map((p) => ({ ...p, tags: deserializeTags(p.tags) })));
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// --- Get single post ---
router.get("/:id", (req, res) => {
  try {
    const post = db
      .prepare(
        `
        SELECT posts.*, categories.name AS category
        FROM posts
        LEFT JOIN categories ON posts.category_id = categories.id
        WHERE posts.id = ?
      `
      )
      .get(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found." });

    res.json({ ...post, tags: deserializeTags(post.tags) });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ error: "Failed to fetch post." });
  }
});

// --- Update post ---
router.put("/:id", (req, res) => {
  try {
    const { title, content, category_id, tags } = req.body;
    const updatedAt = new Date().toISOString();

    const updated = db
      .prepare(
        `
        UPDATE posts
        SET title = ?, content = ?, category_id = ?, tags = ?, updatedAt = ?
        WHERE id = ?
        RETURNING *
      `
      )
      .get(
        title,
        content,
        category_id || null,
        serializeTags(tags),
        updatedAt,
        req.params.id
      );

    if (!updated) return res.status(404).json({ error: "Post not found." });

    // Attach category name
    const joined = db
      .prepare(
        `
        SELECT posts.*, categories.name AS category
        FROM posts
        LEFT JOIN categories ON posts.category_id = categories.id
        WHERE posts.id = ?
      `
      )
      .get(updated.id);

    res.json({ ...joined, tags: deserializeTags(joined.tags) });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Failed to update post." });
  }
});

// --- Delete post ---
router.delete("/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM posts WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0)
      return res.status(404).json({ error: "Post not found." });

    res.status(204).end();
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

export default router;
