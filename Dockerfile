# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set dummy environment variables to satisfy build-time requirements
# These will be overridden by window.__RUNTIME_CONFIG__ at runtime
ENV VITE_BASE44_APP_ID=build_time_placeholder
ENV VITE_BASE44_FUNCTIONS_VERSION=v1
ENV VITE_BASE44_APP_BASE_URL=https://api.base44.com

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/server ./server

# Create data directory
RUN mkdir -p data/uploads

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Expose port 80
EXPOSE 80
ENV PORT=80

CMD ["node", "server/index.js"]
