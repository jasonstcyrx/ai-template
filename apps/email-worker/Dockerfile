# Production Dockerfile for email-worker
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
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S email-worker -u 1001 -G nodejs

COPY --from=builder --chown=email-worker:nodejs /app/dist ./dist
COPY --from=deps --chown=email-worker:nodejs /app/node_modules ./node_modules
COPY --chown=email-worker:nodejs package.json ./

RUN chown -R email-worker:nodejs /app
USER email-worker

CMD ["node", "dist/index.js"]
