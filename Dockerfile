FROM node:20-alpine

WORKDIR /app

# Copy package descriptors first for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure entrypoint script is executable
RUN chmod +x docker-entrypoint.sh

# Expose backend port
EXPOSE 5000

# Set entrypoint and default command
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
