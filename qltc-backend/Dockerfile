# d:\sources\qlct\qltc-backend\Dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# Install ts-node and tsconfig-paths in dev mode
RUN npm install -D ts-node tsconfig-paths
COPY . .

# Add this before your Prisma-related commands or application setup
RUN apk add --no-cache openssl-dev

# Generate Prisma client to src/generated/prisma first, so tsc can use it
RUN npx prisma generate 
 # This compiles src/* (including src/generated/prisma) to dist/*
RUN npm run build
# Compile the seed script separately
RUN npx tsc prisma/seed.ts --outDir dist/seed --esModuleInterop --resolveJsonModule --module commonjs --target es2020

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache openssl openssl-dev

# Copy app source
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

# Install all deps (so @prisma/client can be generated properly)
RUN npm install

# Generate prisma client in final container
RUN npx prisma generate

# Copy built files
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/dist/seed ./dist/seed
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json
COPY tsconfig.prod.json ./tsconfig.prod.json

# Copy the production-specific tsconfig for runtime path resolution
COPY tsconfig.prod.json ./tsconfig.prod.json

# Verify the contents of the dist directory (this will appear in the Docker build logs)
RUN echo "--- Contents of /usr/src/app/dist (Build Check - $(date)) ---" && \
    ls -R /usr/src/app/dist && \
    echo "--- End of /usr/src/app/dist ---" && \
    echo "--- Checking for tsconfig.prod.json (in final image) ---" && \
    ls -l tsconfig.prod.json && \
    echo "--- End of tsconfig.prod.json check ---"
RUN echo "--- Contents of /usr/src/app/src/generated/prisma ---" && \
    ls -R /usr/src/app/src/generated/prisma || echo "❌ MISSING"

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
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npx ts-node -r tsconfig-paths/register src/main.ts"]