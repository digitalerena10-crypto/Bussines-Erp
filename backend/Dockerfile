# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S erp -u 1001 -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create logs directory
RUN mkdir -p logs && chown -R erp:nodejs logs

USER erp

EXPOSE 5000

CMD ["node", "server.js"]
