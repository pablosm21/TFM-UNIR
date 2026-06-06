FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG REACT_APP_API_BASE_URL=http://localhost:3001
ARG REACT_APP_SOCKET_URL=http://localhost:3001
ARG REACT_APP_STATUS_POLL_INTERVAL_MS=3000

ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_SOCKET_URL=${REACT_APP_SOCKET_URL}
ENV REACT_APP_STATUS_POLL_INTERVAL_MS=${REACT_APP_STATUS_POLL_INTERVAL_MS}

RUN npm run build

FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
