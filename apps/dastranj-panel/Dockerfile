FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS builder

ENV DATABASE_URL="postgres://postgres:postgres@172.19.0.8:5432/dastranj"

COPY . .

RUN npm ci && \
    npm --workspace @repo/ui run build && \
    npm --workspace @apps/dastranj-panel run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3030

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/dastranj-panel

EXPOSE 3030

CMD ["npm", "run", "start"]
