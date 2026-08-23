# Stage 1 — build the app
FROM dhi.io/node:26-dev AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

# Install vite explicitly if not already in package.json
RUN npm list vite > /dev/null 2>&1 || npm install --no-save vite@5.4.11

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2 — distroless runtime (minimal, secure)
FROM dhi.io/node:26

WORKDIR /app

# Copy built files from builder
COPY --from=build /app/dist ./dist

COPY server.js .

EXPOSE 4173

# Use exec form for proper signal handling
ENTRYPOINT ["node", "--no-warnings"]
CMD ["server.js"]