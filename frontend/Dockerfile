# Stage 1 — build the app
FROM dhi.io/node:26.4-dev AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2 — runtime (minimal, no build tools or esbuild binary)
FROM dhi.io/node:26

WORKDIR /app

# Copy only the built dist folder and server script
COPY --from=build /app/dist ./dist
COPY server.js .

EXPOSE 4173

ENTRYPOINT ["node", "server.js"]
