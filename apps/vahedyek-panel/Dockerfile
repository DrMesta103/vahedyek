FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

FROM base AS builder

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
