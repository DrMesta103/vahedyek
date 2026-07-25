FROM node:20-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install --global npm@10.9.2

FROM base AS builder

ENV NODE_ENV=development
ENV DATABASE_URL="postgres://postgres:opL0u42d4Yx9Qiv@5.9.164.187:5432/ai-lab-next-app"

COPY . .

RUN sed -i 's#https://package-mirror\.liara\.ir/artifactory/api/npm/npm/#https://registry.npmjs.org/#g' package-lock.json

RUN npm ci --include=dev && \
    npm install --no-save --package-lock=false --include=optional @rollup/rollup-linux-x64-gnu@4.60.2 && \
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
