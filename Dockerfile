# ── Stage 1: build ────────────────────────────────────────
FROM node:24-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# ── Stage 2: runtime ──────────────────────────────────────
FROM node:24-alpine AS runtime

WORKDIR /app/backend

# Create user and data directory before copying files
RUN adduser -D -h /home/appuser appuser \
    && mkdir -p /app/backend/data \
    && chown appuser:appuser /app/backend/data

# Copy with ownership set at copy time — no chown -R needed
COPY --from=build --chown=appuser:appuser /app/backend/node_modules ./node_modules
COPY --from=build --chown=appuser:appuser /app/backend/src          ./src
COPY --from=build --chown=appuser:appuser /app/backend/index.js     ./index.js
COPY --from=build --chown=appuser:appuser /app/backend/package.json ./package.json

ENV NODE_ENV=production

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "index.js"]