# Contact Base Application

A professional contact management system designed to streamline your networking. Import contacts, manage relationships, and organize your network.

## for Users (Self-Hosting)

You can run this application on your own server (Linux, Google Cloud, AWS, etc.) or locally using Docker.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- No external accounts required! This app runs 100% locally with an embedded SQLite database.

### Quick Start (Docker Compose)

1.  Clone this repository or download the package.
2.  Run the application:

    ```bash
    docker-compose up -d
    ```

3.  Open your browser to `http://localhost:8080`.
    - Default Login: `admin@example.com`
    - Default Password: `password`

    ```bash
    docker-compose up -d
    ```

4.  Open your browser to `http://localhost:8080`.

### Manual Docker Run

```bash
docker build -t contact-base .

docker run -d -p 8080:80 contact-base
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

## Licensing

- **Corporations & Businesses**: A commercial license is required to use this software in a corporate environment. Please contact sales@nordheim.online.
- **Individuals**: You are free to run this software for personal use.

Copyright (c) 2026 Chuck Talk <cwtalk1@gmail.com>. All rights reserved.
