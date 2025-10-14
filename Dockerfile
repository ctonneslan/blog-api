# -------------------------------
# Stage 1: Development / Test
# -------------------------------
FROM node:20-alpine AS dev

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Expose for local dev
EXPOSE 3000

CMD ["npm", "run", "dev"]

# -------------------------------
# Stage 2: Production
# -------------------------------
FROM node:20-alpine AS prod

WORKDIR /usr/src/app

# Copy only what's needed for runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled app (no tests, no dev files)
COPY src ./src

EXPOSE 3000
CMD ["npm", "start"]
