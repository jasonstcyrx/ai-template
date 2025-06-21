# Production Dockerfile for notification-service
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
    adduser -S notification-service -u 1001 -G nodejs

COPY --from=builder --chown=notification-service:nodejs /app/dist ./dist
COPY --from=deps --chown=notification-service:nodejs /app/node_modules ./node_modules
COPY --chown=notification-service:nodejs package.json ./

RUN chown -R notification-service:nodejs /app
USER notification-service

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

CMD ["node", "dist/index.js"]
