### STAGE 1: Build ###
FROM node:9.11.1-alpine as builder
ARG branch=develop
ENV BRANCH=$branch
WORKDIR /src/app
RUN mkdir -p /src/app/coriolis
RUN mkdir -p /src/app/coriolis-data

COPY ./coriolis/ /src/app/coriolis
COPY ./coriolis-data/ /src/app/coriolis-data

RUN apk update
RUN apk add git

RUN npm i -g npm

# Set up coriolis-data
WORKDIR /src/app/coriolis-data
RUN git fetch --all
RUN git reset --hard origin/$BRANCH
RUN npm install --no-package-lock
RUN npm start

WORKDIR /src/app/coriolis
RUN git fetch --all
RUN git reset --hard origin/$BRANCH
RUN rm -rf node_modules/
RUN npm install --no-package-lock
RUN npm run build


### STAGE 2: Production Environment ###
FROM nginx:1.13.12-alpine as web
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /src/app/coriolis/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
