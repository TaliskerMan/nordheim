#!/bin/bash

# Setup Script for Nordheim
# Handles configuration for Local vs Cloud and SSL setup.

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Welcome to Nordheim Setup${NC}"
echo "---------------------------"

# 1. Choose Environment
echo "Where are you deploying this instance?"
echo "1) Local Infrastructure (Self-Hosted/Laptop)"
echo "2) Cloud (AWS / Google Cloud)"
read -p "Select option [1]: " ENV_OPTION
ENV_OPTION=${ENV_OPTION:-1}

# 2. Domain Name
if [ "$ENV_OPTION" == "1" ]; then
    DEFAULT_DOMAIN="nordheim.localhost"
    echo -e "\nRunning locally. We recommend using '${DEFAULT_DOMAIN}'."
    echo "Note: You may need to add this to your /etc/hosts file."
else
    DEFAULT_DOMAIN="nordheim.example.com"
    echo -e "\nRunning in Cloud. What is your domain name?"
fi
read -p "Enter Domain Name [${DEFAULT_DOMAIN}]: " DOMAIN_NAME
DOMAIN_NAME=${DOMAIN_NAME:-$DEFAULT_DOMAIN}

# 3. SSL Configuration
echo -e "\nDo you want to enable SSL (HTTPS)?"
if [ "$ENV_OPTION" == "1" ]; then
    echo "1) Yes - Generate Self-Signed Certificate (Recommended for Local)"
    echo "2) No - Run Insecure (HTTP only)"
else
    echo "1) Yes - I will provide my own certificates"
    echo "2) No - Run Insecure (HTTP only) / SSL terminated at Load Balancer"
fi
read -p "Select option [1]: " SSL_OPTION
SSL_OPTION=${SSL_OPTION:-1}

CERT_DIR="./certs"
mkdir -p "$CERT_DIR"

USE_SSL="false"
PORT="8080"

if [ "$SSL_OPTION" == "1" ]; then
    USE_SSL="true"
    PORT="8443"
    
    if [ "$ENV_OPTION" == "1" ]; then
        echo -e "\nGenerating Self-Signed Certificate for ${DOMAIN_NAME}..."
        openssl req -x509 -newkey rsa:4096 -keyout "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" -days 365 -nodes -subj "/CN=${DOMAIN_NAME}"
        echo -e "${GREEN}Certificates generated in ${CERT_DIR}${NC}"
    else
        echo -e "\nPlease place your 'cert.pem' and 'key.pem' in the './certs' directory."
        echo "Waiting for you to copy them... (Press Enter when ready)"
        read
        if [ ! -f "$CERT_DIR/cert.pem" ] || [ ! -f "$CERT_DIR/key.pem" ]; then
            echo "Warning: Certificates not found! Falling back to insecure mode."
            USE_SSL="false"
            PORT="8080"
        fi
    fi
fi

# 4. Generate Configuration
echo -e "\nGenerating configuration..."

# Update .env (or creating docker-compose override)
PROTOCOL="http"
if [ "$USE_SSL" == "true" ]; then
    PROTOCOL="https"
fi

cat > .env <<EOF
VITE_APP_ID=nordheim-local
VITE_APP_FUNCTIONS_VERSION=v1
VITE_APP_BASE_URL=${PROTOCOL}://${DOMAIN_NAME}:${PORT}
PORT=${PORT}
SSL_ENABLED=${USE_SSL}
EOF

if [ "$USE_SSL" == "true" ]; then
    echo "SSL_CERT_PATH=/app/certs/cert.pem" >> .env
    echo "SSL_KEY_PATH=/app/certs/key.pem" >> .env
fi

echo -e "${GREEN}Configuration saved to .env${NC}"

# 5. Build and Run
echo -e "\nWould you like to build and start Nordheim now?"
read -p "Run docker-compose up? [Y/n]: " RUN_NOW
RUN_NOW=${RUN_NOW:-Y}

if [[ "$RUN_NOW" =~ ^[Yy]$ ]]; then
    # Ensure certs are mounted in docker-compose if needed
    # We'll use a docker-compose.override.yml or just update the main one in the "Execute" phase
    # For now, let's just assume the user runs the command.
    echo "Starting..."
    docker-compose up --build -d
    echo -e "${GREEN}Nordheim started!${NC}"
    echo -e "Access it at: ${PROTOCOL}://${DOMAIN_NAME}:${PORT}"
else
    echo "Setup complete. Run 'docker-compose up --build' when ready."
fi
