# d:\sources\qlct\qltc-app\Dockerfile
# Stage 1: Build the Quasar app
FROM node:18-alpine AS builder

# Declare build arguments that can be passed from docker-compose.yml
ARG VITE_API_BASE_URL
ARG VITE_FORCE_DEV_USER

WORKDIR /app
COPY . .

# Ensure VITE_API_BASE_URL is set appropriately for Docker networking (see docker-compose.yml)
# Log the values of the ARGs to confirm they are received during the build
RUN echo "Build-time VITE_API_BASE_URL: $VITE_API_BASE_URL" && \
    echo "Build-time VITE_FORCE_DEV_USER: $VITE_FORCE_DEV_USER"

RUN npm install
# Pass ARGs as environment variables to the build command
RUN VITE_API_BASE_URL=${VITE_API_BASE_URL} VITE_FORCE_DEV_USER=${VITE_FORCE_DEV_USER} npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine
# Copy the built app from the builder stage
COPY --from=builder /app/dist/spa /usr/share/nginx/html
# Copy a custom Nginx configuration (optional, but good for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
