# Release Notes - Nordheim v1.0.0

**Nordheim** is a professional, privacy-first contact management system designed for seamless networking and relationship management. This release marks a significant milestone in our journey, transitioning to a fully independent, self-hostable architecture.

## 🚀 Key Features

### 🔒 Privacy & Independence
- **100% Local**: Validated to run entirely offline or on your private infrastructure. No external SaaS dependencies.
- **Embedded Database**: Uses SQLite for a lightweight, zero-configuration database layer.
- **Data Sovereignty**: You own your data. Your contacts never leave your server.

### 🛠 Deployment & Setup
- **New Setup Wizard**: Introducing `setup.sh`, an interactive CLI tool to configure your environment in seconds.
    - Choose between **Local** (self-hosted) or **Cloud** (AWS/GCP) profiles.
    - Auto-configure domain names and ports.
- **SSL Support**: Built-in tools to secure your connection.
    - **Local**: Automatically generate self-signed certificates for secure local development (`https://nordheim.localhost`).
    - **Cloud**: Easy integration points for custom SSL certificates.

### 🎨 Rebranding
- **New Identity**: "Contact Base" is now **Nordheim**.
- **Refined UI**: Updated branding assets and titles across the application.

## 🔧 Technical Improvements
- **Local API Client**: Replaced external API calls with a robust, local internal generic client (`src/api/client.js`).
- **Docker Optimization**: Streamlined `Dockerfile` and `docker-compose.yml` for faster builds and easier port configuration.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/TaliskerMan/nordheim.git

# Run the setup wizard
./setup.sh

# Start the application
docker-compose up -d
```
