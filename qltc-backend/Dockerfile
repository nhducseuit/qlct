# d:\sources\qlct\qltc-backend\Dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
# We will reinstall production dependencies to ensure a clean state
COPY --from=builder /usr/src/app/package*.json ./
# Copy the prisma schema before installing production dependencies
# so that `prisma generate` (run by @prisma/client postinstall) uses the correct binaryTargets
COPY --from=builder /usr/src/app/prisma ./prisma
RUN npm install --only=production

# Copy the production-specific tsconfig for runtime path resolution
COPY tsconfig.prod.json ./tsconfig.prod.json

# Verify the contents of the dist directory (this will appear in the Docker build logs)
RUN echo "--- Contents of /usr/src/app/dist (Build Check - $(date)) ---" && \
    ls -R /usr/src/app/dist && \
    echo "--- End of /usr/src/app/dist ---" && \
    echo "--- Checking for tsconfig.prod.json (in final image) ---" && \
    ls -l tsconfig.prod.json && \
    echo "--- End of tsconfig.prod.json check ---"

# Tell tsconfig-paths to use the production-specific tsconfig file
ENV TS_NODE_PROJECT="tsconfig.prod.json"
# You can still try to enable debug logs if needed
ENV DEBUG="tsconfig-paths:*"

# Expose the port the app runs on
EXPOSE 3000
# Command to run the application
# If the app still fails to start, uncomment the next line and comment out the one after
# to keep the container running for inspection:
# CMD ["sh", "-c", "echo 'Container is running with tail, inspect with docker exec.' && tail -f /dev/null"]
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
