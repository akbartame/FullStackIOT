# ── Stage 1: build ────────────────────────────────────────
# Install deps including native addon compilation (better-sqlite3)
FROM node:24-alpine AS build

# Build tools required for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# ── Stage 2: runtime ──────────────────────────────────────
# Lean image — only production artifacts
FROM node:24-alpine AS runtime

WORKDIR /app/backend

# Copy only production node_modules and app source from build stage
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/src          ./src
COPY --from=build /app/backend/index.js     ./index.js
COPY --from=build /app/backend/package.json ./package.json

# Create SQLite data directory with correct permissions
RUN mkdir -p /app/backend/data

ENV NODE_ENV=production

# Create unprivileged user and transfer ownership
RUN adduser -D -h /home/appuser appuser \
    && chown -R appuser:appuser /app/backend

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]