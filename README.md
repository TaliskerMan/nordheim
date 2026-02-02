# Nordheim

A professional contact management system designed to streamline your networking. Import contacts, manage relationships, and organize your network.

## for Users (Self-Hosting)

You can run this application on your own server (Linux, Google Cloud, AWS, etc.) or locally using Docker.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- No external accounts required! This app runs 100% locally with an embedded SQLite database.

### Quick Start (Recommended)

1.  Clone this repository.
2.  Run the setup wizard:

    ```bash
    ./setup.sh
    ```

    This script will guide you through:
    - Choosing between Local or Cloud deployment.
    - Setting up your domain (e.g., `nordheim.localhost` or `nordheim.com`).
    - Enabling SSL (HTTPS) with auto-generated self-signed certificates for local development.

3.  Access your application:
    - Local Insecure: `http://localhost:8080`
    - Local Secure: `https://nordheim.localhost:8443` (Accept the self-signed cert warning)

### Manual Docker Run

```bash
docker build -t nordheim .
# Run insecure
docker run -d -p 8080:80 nordheim
# Run secure (requires mounting certs and setting env vars, see docker-compose.yml)
```

## for Developers

### Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

## Enterprise Features

Nordheim includes powerful features for corporate environments:

- **Role-Based Access Control (RBAC)**: secure the application ensuring only admins can edit data; viewers can only read.
- **Audit Logging**: Track all administrator actions (login, edits, imports) for compliance.
- **Multi-User Scaling**: Unlimited viewers with restricted editing rights.

### Enterprise Setup

To unlock multi-user capabilities and remove restrictions, a valid `license.key` is required.
1. Obtain a license from [Nordheim.online](https://nordheim.online) or contact `sales@nordheim.online`.
2. Place the `license.key` file in the `data/` directory.

## Licensing

- **Corporations & Businesses**: A commercial license is required to use this software in a corporate environment. Access to the Admin features for multi-user scaling requires a valid license key.
- **Individuals**: You are free to run this software for personal use.

Copyright (c) 2026 Chuck Talk <cwtalk1@gmail.com>. All rights reserved.
