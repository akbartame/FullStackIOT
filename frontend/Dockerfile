# ── Frontend: Multi-mode Dockerfile ───────────────────
ARG BUILD_MODE=prod

# ── Development stage ──────────────────────────────────
FROM node:24-alpine AS dev

WORKDIR /app/frontend

COPY package*.json ./
RUN npm ci

COPY . ./

ENV VITE_HOST=0.0.0.0

EXPOSE 5173

CMD ["npm", "run", "dev"]

# ── Production build stage ─────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app/frontend

COPY package*.json ./
RUN npm ci

COPY . ./

RUN npm run build

# ── Production runtime with nginx ──────────────────────
FROM nginx:alpine AS prod

# Copy nginx config with gzip and caching
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 0

CMD ["nginx", "-g", "daemon off;"]

# ── Final stage: select based on BUILD_MODE ───────────
FROM ${BUILD_MODE}
