FROM node:22-slim

RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm install -g @inkeep/open-knowledge@latest

RUN ok init

COPY patch-loopback.mjs /tmp/patch-loopback.mjs

RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'node /tmp/patch-loopback.mjs' >> /docker-entrypoint.sh && \
    echo 'exec ok start -H 0.0.0.0 -p ${PORT:-39847} --react-shell-dist-dir /usr/local/lib/node_modules/@inkeep/open-knowledge/dist/public' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

ENV PORT=39847
EXPOSE 39847

ENTRYPOINT ["/docker-entrypoint.sh"]
