######################
## Website build image
######################

FROM node:latest AS website-build

# Set working directory
WORKDIR /tmp/orryweb

# Copy files
COPY . .

# Install Node modules
RUN npm install

# Build website
RUN npm run build

###############
## Server image
###############

FROM node:latest

# Set working directory
WORKDIR /usr/orryweb

# Installer Wrangler
RUN npm install -g wrangler

# Copy website files
COPY --from=website-build /tmp/orryweb/dist .

# Run the website in Wrangler
ENTRYPOINT wrangler pages dev . --port 8080
