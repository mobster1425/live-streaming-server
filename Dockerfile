# Build stage
FROM node:16 AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set proper permissions
RUN chmod -R 755 .

# Build the NestJS application using npm run
RUN npm run build

# Production stage
FROM node:16-slim

# Install nginx and build essentials for bcrypt
RUN apt-get update && apt-get install -y nginx python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies and rebuild bcrypt
RUN npm ci --only=production && npm rebuild bcrypt --build-from-source

# Copy built assets from the builder stage
COPY --from=builder /usr/src/app/dist ./dist


# Copy the frontend files to the nginx html directory
COPY index.html /var/www/html/
COPY client.js /var/www/html/

# Copy a custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
# EXPOSE 80 3000
EXPOSE 80

# Start both nginx and the NestJS application
CMD service nginx start && node dist/main