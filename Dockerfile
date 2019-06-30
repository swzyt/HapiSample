#
# docker build --rm -t hapisimple:v1 .

# FROM node:8

# RUN mkdir -p /home/app/api/hapisimple
# WORKDIR /home/app/api/hapisimple
# COPY . /home/app/api/hapisimple
# # RUN npm install
# EXPOSE 8888

# ENTRYPOINT ["npm", "run"]
# CMD ["start"]

# 基于基础镜像，创建api
FROM commodules:v1
MAINTAINER suwei
RUN mkdir -p /home/app/api/hapisimple
WORKDIR /home/app/api/hapisimple
COPY . /home/app/api/hapisimple

# copy app commodules source
# 将基础镜像中的node_modules 软链接至项目根目录下
RUN ln -s /home/app/api/share/modules/node_modules /home/app/api/hapisimple/node_modules
# RUN mkdir -p /home/app/api/hapisimple/node_modules
# WORKDIR /home/app/api/share/modules/node_modules
# COPY /home/app/api/share/modules/node_modules /home/app/api/hapisimple/node_modules

WORKDIR /home/app/api/hapisimple

# RUN npm install
EXPOSE 8888