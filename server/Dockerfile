FROM node:22.12-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy source
COPY src/ ./src/
COPY .env ./

# Run migration then start
CMD node src/db/migrate.js && node src/index.js
