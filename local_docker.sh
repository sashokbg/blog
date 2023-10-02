jekyll build

docker build -t alex_blog:latest .

docker run -v ./blog.local.conf:/etc/nginx/conf.d/blog.conf -p 8080:80 alex_blog:latest
