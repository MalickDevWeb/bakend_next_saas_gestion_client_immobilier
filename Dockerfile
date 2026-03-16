FROM node:20-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependances
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY --from=dependances /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev

FROM base AS production
ENV NODE_ENV=production
ENV PORT=10000
COPY --from=build /app ./
RUN chmod +x /app/scripts/demarrer-render.sh
EXPOSE 10000
CMD ["/app/scripts/demarrer-render.sh"]
