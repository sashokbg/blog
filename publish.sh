jekyll build

docker build -t sashokbg/alex_blog:latest .

docker push sashokbg/alex_blog:latest

kubectl rollout restart deployment/home-cloud-blog -n home-cloud
