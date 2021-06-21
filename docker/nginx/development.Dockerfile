FROM nginx:latest

# Copy Nginx config
COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
