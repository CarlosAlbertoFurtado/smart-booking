FROM node:18-alpine AS base
WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl openssl-dev

# Install dependencies only
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# Production image
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 smartbooking

COPY --from=deps --chown=smartbooking:nodejs /app/node_modules ./node_modules
COPY --chown=smartbooking:nodejs . .

RUN npx prisma generate

USER smartbooking

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npx", "tsx", "src/shared/server.ts"]
