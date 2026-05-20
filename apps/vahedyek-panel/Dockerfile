FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
COPY apps/vahedyek-panel/package.json apps/vahedyek-panel/package.json
COPY apps/dastranj-panel/package.json apps/dastranj-panel/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/layout/package.json packages/layout/package.json
COPY packages/utils/package.json packages/utils/package.json
COPY packages/access-control/package.json packages/access-control/package.json
COPY packages/database-core/package.json packages/database-core/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci

FROM deps AS builder

COPY . .

RUN npm --workspace @repo/ui run build && npm --workspace @apps/vahedyek-panel run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/vahedyek-panel

EXPOSE 3000

CMD ["npm", "run", "start"]
