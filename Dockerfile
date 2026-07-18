# Precious Frame - single container serving the API and built web UI.
# Works on common container hosts such as Railway, Render, and Fly.io.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
RUN npm ci
COPY . .
RUN npm run build -w web

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY server/package.json server/
RUN npm ci -w server --omit=dev && npm cache clean --force
COPY server server
COPY precious-frame.config.json ./
COPY --from=build /app/web/dist web/dist

EXPOSE 4000
CMD ["npx", "tsx", "server/src/server.ts"]
