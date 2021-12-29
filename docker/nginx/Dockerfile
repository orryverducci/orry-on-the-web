#######################
## Frontend build image
#######################

FROM node:latest AS frontend-build

# Set working directory
WORKDIR /tmp/orryweb

# Copy website files
COPY ./website .

# Install Node modules
RUN npm install

# Build frontend
RUN npm run production

#########################
## Server container image
#########################

FROM nginx:latest

# Define variable for the Nginx configuration file name
ARG conf

# Set working directory
WORKDIR /usr/orryweb

# Copy Nginx config
COPY ./docker/nginx/$conf /etc/nginx/conf.d/default.conf

# Copy website files
COPY --from=frontend-build /tmp/orryweb .
