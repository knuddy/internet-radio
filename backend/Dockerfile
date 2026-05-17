# --- Build & Dependency Installation ---
FROM node:24-alpine AS builder
WORKDIR /app

# Install build essentials (needed if any npm packages compile native C++ modules)
RUN apk add --no-cache python3 make g++

# Copy configurations required for installation
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Clean install dependencies across the workspace (focusing on the worker)
RUN npm ci --workspace=backend --include-workspace-root

# Copy the actual worker source code and TS configs
COPY tsconfig.base.json ./
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src

# Force-install typescript in the builder stage so 'tsc' is globally accessible
RUN npm install -g typescript


# Build the worker into JavaScript (generates the dist/ folder)
RUN npm run build --workspace=backend

# Strip out devDependencies to keep the production image tiny
RUN npm prune --production --workspace=backend


# --- Production Runtime ---
FROM node:24-alpine AS runner
WORKDIR /app

# Install system-level binaries: ffmpeg and yt-dlp (YouTube Downloader)
RUN apk add --no-cache ffmpeg yt-dlp

# Copy the pruned node_modules and compiled JavaScript
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

# Set environment to production
ENV NODE_ENV=production