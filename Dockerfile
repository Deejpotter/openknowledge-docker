FROM node:22-slim

# Install git and dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install OpenKnowledge globally (latest version)
RUN npm install -g @inkeep/open-knowledge@latest

# Initialize a default OpenKnowledge project
RUN ok init

# Create docker-entrypoint.sh at root (Coolify expects this)
RUN echo '#!/bin/sh\nexec ok "$@"' > /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose the port (OpenKnowledge uses 39847 by default)
EXPOSE 39847

# Start OpenKnowledge
CMD ["ok", "start", "--host", "0.0.0.0"]
