# Production Dockerfile for backend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn build

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true

FROM node:18-alpine AS production
RUN apk add --no-cache curl
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs

COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=deps --chown=backend:nodejs /app/node_modules ./node_modules
COPY --chown=backend:nodejs package.json ./

RUN chown -R backend:nodejs /app
USER backend

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3003/health || exit 1

CMD ["node", "dist/main.js"]
