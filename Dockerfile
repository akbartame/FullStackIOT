# Base image node:24-alpine is used for both backend and frontend stages
FROM node:24-alpine AS base

WORKDIR /app


# Backend stage
FROM base AS backend

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend/ ./


