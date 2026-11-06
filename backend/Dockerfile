
# 1. Use official Node.js runtime
FROM node:22-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install production dependencies
RUN npm ci --omit=dev

# 5. Copy application source code
COPY --chown=node:node src ./src

# 6. Use non-root user
USER node

# 7. Application port
EXPOSE 5000

# 8. Start application
CMD ["npm", "start"]
