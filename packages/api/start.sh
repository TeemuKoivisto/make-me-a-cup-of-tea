#!/bin/sh

pnpm --filter @make-me-a-cup-of-tea/quarterback-db prod:migrate && \
node ./quarterback-packages/api/dist/index.js