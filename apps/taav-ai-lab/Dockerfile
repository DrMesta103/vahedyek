FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS builder

ENV NODE_ENV=development
ENV DATABASE_URL="postgres://postgres:opL0u42d4Yx9Qiv@5.9.164.187:5432/ai-lab-next-app"

COPY . .

RUN npm ci --include=dev && \
    npm --workspace @repo/ui run build && \
    npm --workspace @apps/taav-ai-lab run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/taav-ai-lab

EXPOSE 3000

CMD ["npm", "run", "start"]
