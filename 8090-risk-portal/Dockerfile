# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set build-time environment variables
ENV VITE_GEMINI_API_KEY=AIzaSyCoSD-8L8fZp3YiauuKTjPuuHYY4QHmqeo

# Build the React application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy server files
COPY server.cjs ./
COPY server ./server

# Copy service account key (this will be injected at build time)
# Note: In production, use Google Secret Manager instead
COPY service-account-key.json ./

# Copy public files (auth.html, auth.js, etc.)
COPY public ./public

# Copy the built React app from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the unified server - explicitly use server.cjs
CMD ["node", "server.cjs"]