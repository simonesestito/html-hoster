FROM node:latest AS build
WORKDIR /usr/app/build
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .
RUN ng build --prod --build-optimizer

FROM nginx:latest
COPY nginx-conf.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/app/build/dist/html-hoster/ /usr/share/nginx/html/
EXPOSE 80

