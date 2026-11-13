# Production image for the whole app: the API serves the built frontend from the same origin.
# Build from the repository root: docker build -t greenapi .
# (greenapi-back/Dockerfile stays the dev/API-only image used by docker compose.)

FROM node:22-alpine AS base
RUN corepack enable

FROM base AS front
WORKDIR /front
RUN corepack prepare pnpm@10.26.2 --activate
COPY greenapi-front/package.json greenapi-front/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY greenapi-front/ .
RUN pnpm build

FROM base AS back
WORKDIR /app
COPY greenapi-back/package.json greenapi-back/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY greenapi-back/ .
RUN pnpm build

FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV STATIC_DIR=/app/public
COPY greenapi-back/package.json greenapi-back/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=back /app/dist ./dist
COPY --from=front /front/dist ./public
CMD ["node", "dist/main.js"]
