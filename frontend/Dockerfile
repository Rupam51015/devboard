# Pin a specific Node version (never a floating `latest`).
FROM node:20-alpine

# Run as a dedicated non-root user, not root.
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

# Install deps first for better layer caching (re-runs only when deps change).
COPY package*.json ./
RUN npm ci

# Copy the source and build the production bundle into /dist.
COPY . .
RUN npm run build

# Hand ownership to the non-root user, then drop privileges.
RUN chown -R app:app /app
USER app

# Vite preview serves the built bundle on this port.
EXPOSE 4173

# 0.0.0.0 so the server is reachable from outside the container.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
