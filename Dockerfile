FROM nginx:alpine

ADD site /blog
ADD blog.conf /etc/nginx/conf.d/blog.conf
