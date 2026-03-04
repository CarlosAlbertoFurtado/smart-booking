FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && cp -R node_modules /tmp/prod_node_modules
RUN npm ci

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 smartbooking

COPY --from=build --chown=smartbooking:nodejs /app/dist ./dist
COPY --from=build --chown=smartbooking:nodejs /app/prisma ./prisma
COPY --from=deps --chown=smartbooking:nodejs /tmp/prod_node_modules ./node_modules
COPY --chown=smartbooking:nodejs package*.json ./

USER smartbooking

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/shared/server.js"]
