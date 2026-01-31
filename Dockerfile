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
FROM nginx:alpine

# Install bash for the entrypoint script
RUN apk add --no-cache bash

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/dist .

# Copy custom entrypoint script
COPY entrypoint.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
