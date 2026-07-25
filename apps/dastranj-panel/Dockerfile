FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install --global npm@10.9.2

FROM base AS builder

ENV NODE_ENV=development
ENV DATABASE_URL="postgres://postgres:postgres@172.19.0.8:5432/dastranj"

COPY . .

RUN if [ -f package-lock.json ]; then \
    sed -i 's#https://package-mirror\.liara\.ir/artifactory/api/npm/npm/#https://registry.npmjs.org/#g' package-lock.json; \
    fi

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
