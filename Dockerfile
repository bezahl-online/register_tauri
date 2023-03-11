# build stage
FROM node:alpine3.12 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm audit fix
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY nginx/certs /etc/nginx/certs
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
