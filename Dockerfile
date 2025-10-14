# ---------- Base image ----------
FROM node:20-alpine

# ---------- Working directory ----------
WORKDIR /usr/src/app

# ---------- Copy package files first (better layer caching) ----------
COPY package*.json ./

# ---------- Install dependencies ----------
RUN npm ci --omit=dev

# ---------- Copy application code ----------
COPY src ./src

# ---------- Expose port ----------
EXPOSE 3000

# ---------- Start command ----------
CMD ["node", "src/server.js"]
