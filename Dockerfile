FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci && npm ci --prefix client
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/app ./app
COPY --from=build --chown=node:node /app/shared ./shared
COPY --from=build --chown=node:node /app/scripts/database ./scripts/database
COPY --from=build --chown=node:node /app/client/dist ./client/dist
USER node
EXPOSE 3001
CMD ["node", "app/server/server.js"]
