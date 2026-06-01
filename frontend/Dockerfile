# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api/
ARG VITE_DJANGO_ORIGIN=
ARG VITE_API_DIRECT=true
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DJANGO_ORIGIN=$VITE_DJANGO_ORIGIN
ENV VITE_API_DIRECT=$VITE_API_DIRECT

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
