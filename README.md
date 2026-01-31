# Contact Base Application

A professional contact management system designed to streamline your networking. Import contacts, manage relationships, and organize your network.

## for Users (Self-Hosting)

You can run this application on your own server (Linux, Google Cloud, AWS, etc.) or locally using Docker.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- A **Base44 App ID** and associated API keys. 
  - *If you purchased this software, these will be provided to you.*
  - *If you are an individual user, you can generate these by creating a project on Base44.*

### Quick Start (Docker Compose)

1.  Clone this repository or download the package.
2.  Create a `.env` file in the root directory (or modify `docker-compose.yml` directly):

    ```ini
    VITE_BASE44_APP_ID=your_app_id_here
    VITE_BASE44_FUNCTIONS_VERSION=v1
    VITE_BASE44_APP_BASE_URL=https://api.base44.com
    ```

3.  Run the application:

    ```bash
    docker-compose up -d
    ```

4.  Open your browser to `http://localhost:8080`.

### Manual Docker Run

```bash
docker build -t contact-base .

docker run -d -p 8080:80 \
  -e VITE_BASE44_APP_ID=your_app_id \
  -e VITE_BASE44_FUNCTIONS_VERSION=v1 \
  -e VITE_BASE44_APP_BASE_URL=https://api.base44.com \
  contact-base
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
