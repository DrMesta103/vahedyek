FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS builder

ENV DATABASE_URL="postgres://postgres:postgres@172.19.0.8:5432/vahedyek"

COPY . .

RUN npm ci && \
    npm --workspace @repo/ui run build && \
    npm --workspace @apps/vahedyek-panel run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/vahedyek-panel

EXPOSE 3000

CMD ["npm", "run", "start"]
