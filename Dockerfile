
# Multi-stage build for production
FROM node:24-alpine AS base

WORKDIR /app

# Backend build stage: install deps and copy source
FROM base AS backend
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production=false
COPY backend/ ./

# Final runtime image: copy built backend, run as non-root user
FROM node:24-alpine AS runtime
WORKDIR /app/backend

# Copy app from build stage (includes node_modules)
COPY --from=backend /app/backend /app/backend

ENV NODE_ENV=production
ENV API_PORT=3000

# Create unprivileged user and set permissions
RUN adduser -D -h /home/appuser appuser \
	&& chown -R appuser:appuser /app/backend

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]


