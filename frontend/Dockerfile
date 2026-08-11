# ── Stage 1: Build the React/Vite app ───────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the production bundle → outputs to /app/dist
RUN npm run build

# ── Stage 2: Serve the built files ───────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install 'serve' to host the static files
RUN npm install -g serve

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port (Railway injects $PORT at runtime)
EXPOSE 3000

# Start the static file server
CMD ["sh", "-c", "serve -s dist -l $PORT"]
