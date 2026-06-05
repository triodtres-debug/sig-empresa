FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10 --activate
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

FROM deps AS build-api
COPY packages/database packages/database
COPY apps/api apps/api
RUN pnpm --filter @sig/database generate
RUN pnpm --filter @sig/api build

FROM deps AS build-web
COPY . .
RUN pnpm --filter @sig/web build

FROM base AS api
COPY --from=build-api /app /app
EXPOSE 3001
CMD pnpm --filter @sig/database migrate:deploy && node apps/api/dist/main.js

FROM base AS web
COPY --from=build-web /app /app
EXPOSE 3000
CMD pnpm --filter @sig/web start
