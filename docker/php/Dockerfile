FROM php:8.1-fpm

# Define variable for the php configuration file name
ARG conf

# Set working directory
WORKDIR /usr/orryweb

# Install system dependencies and then clear the cache
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install bcmath exif gd mbstring pcntl

# Use production PHP config and copy custom config
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY ./docker/php/$conf "$PHP_INI_DIR/conf.d/local.ini"

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy website files
COPY ./website .

# Set permissions
RUN chown -R www-data:www-data /usr/orryweb

# Install Laravel dependencies
RUN composer install

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
