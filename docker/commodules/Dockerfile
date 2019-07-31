#制作 node_modules 公共镜像
#docker build --rm -t -d commodules:v1 .
FROM node:8

MAINTAINER suwei

ENV LANG C.UTF-8

# Create directory
RUN mkdir -p /home/app/api/share/modules

WORKDIR /home/app/api/share/modules

COPY . /home/app/api/share/modules

RUN npm install && node