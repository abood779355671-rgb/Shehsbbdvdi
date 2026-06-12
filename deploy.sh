#!/bin/bash
set -e

echo "========================================"
echo "   YT Downloader Pro — Deploy Script   "
echo "========================================"

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "[ERROR] Docker is not installed. Please install Docker first."
  exit 1
fi

if ! command -v docker compose &> /dev/null && ! docker-compose version &> /dev/null 2>&1; then
  echo "[ERROR] Docker Compose is not installed."
  exit 1
fi

# Copy .env
if [ ! -f .env ]; then
  echo "[INFO] Creating .env from .env.example..."
  cp .env.example .env
  SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 64 | head -n 1)
  sed -i "s/change-me-in-production-use-long-random-string/$SECRET/" .env
  echo "[INFO] .env created. Review and update credentials if needed."
fi

# Create SSL directory
mkdir -p nginx/ssl

# Check if SSL certs exist
if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
  echo "[WARN] SSL certificates not found in nginx/ssl/"
  echo "[INFO] For production: copy your SSL certs to nginx/ssl/fullchain.pem and nginx/ssl/privkey.pem"
  echo "[INFO] For Let's Encrypt: use certbot and then restart."
  echo "[INFO] Generating self-signed cert for testing..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/privkey.pem \
    -out nginx/ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=YTDownloader/CN=localhost" 2>/dev/null || true
fi

echo "[INFO] Building and starting services..."

# Use docker compose or docker-compose
if command -v docker compose &> /dev/null; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi

$COMPOSE down --remove-orphans 2>/dev/null || true
$COMPOSE build --no-cache
$COMPOSE up -d

echo ""
echo "========================================"
echo "  Deployment complete!"
echo "  HTTP:  http://localhost"
echo "  HTTPS: https://localhost"
echo ""
echo "  Default credentials:"
echo "  Username: admin"
echo "  Password: abood123"
echo ""
echo "  To view logs: docker compose logs -f"
echo "  To stop:      docker compose down"
echo "========================================"
