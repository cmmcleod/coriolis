### STAGE 1: Build ###
FROM node:9.11.1-alpine as builder
ENV BRANCH=master
WORKDIR /src/app
RUN mkdir -p /src/app/coriolis
RUN mkdir -p /src/app/coriolis-data

RUN apk add --update git

RUN npm i -g npm
ADD https://api.github.com/repos/edcd/coriolis-data/git/refs/heads/master /tmp/version.json

# Set up coriolis-data
WORKDIR /src/app/coriolis-data
RUN git clone https://github.com/EDCD/coriolis-data.git .
RUN git checkout ${BRANCH}
RUN npm install --no-package-lock
RUN npm start


ADD https://api.github.com/repos/edcd/coriolis/git/refs/heads/master /tmp/version.json
# Set up coriolis
WORKDIR /src/app/coriolis
RUN git clone https://github.com/EDCD/coriolis.git .
RUN git checkout ${BRANCH}
RUN npm install --no-package-lock
RUN npm run build


### STAGE 2: Production Environment ###
FROM fholzer/nginx-brotli as web
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /src/app/coriolis/build /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
