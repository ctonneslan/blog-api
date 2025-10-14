import express from "express";
import db from "./db.js";

const router = express.Router();

// Create category
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const stmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
  const info = stmt.run(name);
  res.status(201).json({ id: info.lastInsertRowid, name });
});

// Get all categories
router.get("/", (_req, res) => {
  const categories = db.prepare("SELECT * FROM categories").all();
  res.json(categories);
});

export default router;
