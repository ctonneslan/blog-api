import request from "supertest";
import express from "express";
import postsRouter from "../src/posts.js";
import db from "../src/db.js";

const app = express();
app.use(express.json());
app.use("/posts", postsRouter);

beforeEach(() => {
  db.prepare("DELETE FROM posts").run();
});

describe("Blog API CRUD", () => {
  test("POST /posts → creates a post", async () => {
    const res = await request(app)
      .post("/posts")
      .send({
        title: "My first post",
        content: "This is a test post",
        category: "Testing",
        tags: ["jest", "supertest"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("My first post");
    expect(res.body.id).toBeDefined();
  });

  test("GET /posts → returns all posts", async () => {
    db.prepare(
      `INSERT INTO posts (title, content, category, tags, createdAt, updatedAt) 
        VALUES ('A', 'B', 'C', '[]', datetime('now'), datetime('now'))`
    ).run();

    const res = await request(app).get("/posts");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /posts/:id → returns a single post", async () => {
    const insert = db
      .prepare(
        `INSERT INTO posts (title, content, category, tags, createdAt, updatedAt)
         VALUES ('Hello', 'World', 'Misc', '[]', datetime('now'), datetime('now'))
        `
      )
      .run();

    const res = await request(app).get(`/posts/${insert.lastInsertRowid}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Hello");
  });

  test("PUT /posts/:id → updates a post", async () => {
    const insert = db
      .prepare(
        `
        INSERT INTO posts (title, content, category, tags, createdAt, updatedAt)
        VALUES ('Old', 'Data', 'Misc', '[]', datetime('now'), datetime('now'))
        `
      )
      .run();

    const res = await request(app)
      .put(`/posts/${insert.lastInsertRowid}`)
      .send({
        title: "Updated title",
        content: "Updated content",
        category: "Updated",
        tags: ["updated"],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated title");
  });

  test("DELETE /posts/:id → deletes a post", async () => {
    const insert = db
      .prepare(
        `
        INSERT INTO posts (title, content, category, tags, createdAt, updatedAt)
        VALUES ('Temp', 'Delete me', 'Misc', '[]', datetime('now'), datetime('now'))
        `
      )
      .run();

    const res = await request(app).delete(`/posts/${insert.lastInsertRowid}`);
    expect(res.statusCode).toBe(204);
  });

  test("GET /posts?term= filters posts by term", async () => {
    db.prepare(
      `
        INSERT INTO posts (title, content, category, tags, createdAt, updatedAt)
        VALUES ('Tech Trends', 'New AI models', 'Technology', '[]', datetime('now'), datetime('now'))`
    ).run();

    const res = await request(app).get("/posts?term=Tech");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toContain("Tech");
  });
});
