FROM node:20-bookworm-slim

WORKDIR /app

# Toolchain needed by allowlisted build actions (javac/g++/python/make).
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    g++ \
    make \
    openjdk-17-jdk-headless \
    python3 \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "start"]
