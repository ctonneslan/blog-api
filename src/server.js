import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import postsRouter from "./posts.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.get("/", (_req, res) => res.send("📝 Blog API Running"));
app.use("/posts", postsRouter);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
