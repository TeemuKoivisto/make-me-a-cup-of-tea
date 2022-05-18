#####################
# The Node.js image #
#####################
# Not using builder image since it's quite tedious to copy / install everything all over
FROM node:16.10.0-alpine3.11

ENV NODE_ENV build
ENV INSTALL_PATH /usr/local/quarterback_api
ENV PNPM_PATH /home/node/.pnpm

WORKDIR ${INSTALL_PATH}

RUN npm install -g pnpm@7
RUN pnpm config set store-dir ${PNPM_PATH}

COPY package.json tsconfig.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy package.jsons first to cache pnpm install to run only if they were changed, not on source file changes
COPY packages/api/package.json ./packages/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN pnpm i --frozen-lockfile --filter @make-me-a-cup-of-tea/quarterback-api \
  --filter @make-me-a-cup-of-tea/quarterback-db \
  --filter @make-me-a-cup-of-tea/quarterback-shared

COPY packages/db ./packages/db
RUN pnpm --filter @make-me-a-cup-of-tea/quarterback-db generate
COPY packages/db/prisma/schema.prisma ./node_modules/schema.prisma

COPY packages/shared ./packages/shared
RUN pnpm --filter @make-me-a-cup-of-tea/quarterback-shared build

COPY packages/api ./packages/api
# RUN pnpm test --filter @make-me-a-cup-of-tea/quarterback-api test
RUN pnpm --filter @make-me-a-cup-of-tea/quarterback-api build

# RUN pnpm prune

ENV CORS_SAME_ORIGIN true

EXPOSE ${PORT}

CMD ./packages/api/start.sh