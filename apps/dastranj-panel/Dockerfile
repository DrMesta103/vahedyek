FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

FROM base AS builder

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
