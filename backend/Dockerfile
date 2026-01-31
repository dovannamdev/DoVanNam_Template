FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 2937

# Start in dev mode with hot reload
CMD ["npm", "run", "start:dev"]
