# YT Downloader Pro 🎬

A professional, full-stack YouTube downloader web application built with Next.js, FastAPI, PostgreSQL, and Redis. Features a modern dark glassmorphism UI with authentication, video analysis, multi-quality downloads, and download history management.

---

## Features

- **Secure Login** — JWT-based authentication (admin/abood123 by default)
- **Video Analysis** — Fetch video metadata, thumbnail, stats, available formats
- **Multi-quality Video Download** — MP4 in all available resolutions (4K, 1080p, 720p, etc.)
- **Audio Download** — MP3 extraction in various bitrates
- **Download History** — View, search, and delete previous downloads
- **Modern UI** — Dark mode, glassmorphism, smooth animations, responsive design
- **Production-Ready** — Docker Compose, Nginx reverse proxy, SSL support

---

## Quick Start (Docker)

### 1. Clone / extract the project

```bash
cd youtube-downloader
```

### 2. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

Then open **http://localhost** in your browser.

---

## Manual Docker Compose

```bash
# Copy and configure environment
cp .env.example .env

# Generate SSL certs (self-signed for testing)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=localhost"

# Start all services
docker compose up -d --build

# View logs
docker compose logs -f
```

---

## Development Mode

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Production Deployment (VPS)

### 1. Set up your domain

Point your domain's A record to your VPS IP.

### 2. Get SSL certificate with Certbot

```bash
apt install certbot
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

### 3. Update nginx.conf

Edit `nginx/nginx.conf` and replace `yourdomain.com` with your actual domain.

### 4. Update .env

```env
SECRET_KEY=<your-secret-32+-chars>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### 5. Deploy

```bash
./deploy.sh
```

### 6. Auto-renew SSL

```bash
echo "0 12 * * * root certbot renew --quiet && docker compose restart nginx" >> /etc/crontab
```

---

## Default Credentials

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `abood123` |

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend   | FastAPI, SQLAlchemy, Alembic        |
| Database  | PostgreSQL 16                       |
| Cache     | Redis 7                             |
| Downloader| yt-dlp + ffmpeg                     |
| Proxy     | Nginx                               |
| Container | Docker + Docker Compose             |

---

## Project Structure

```
youtube-downloader/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── config.py         # Settings
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # JWT auth
│   │   ├── routers/          # API routes
│   │   └── services/         # yt-dlp & cache
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/              # Pages (login, dashboard)
│   │   ├── components/       # React components
│   │   ├── lib/              # API client, utils
│   │   └── types/            # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   ├── nginx.conf            # Nginx config
│   └── ssl/                  # SSL certificates
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
├── deploy.sh                 # One-click deploy script
└── .env.example              # Environment template
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/videos/analyze` | Analyze YouTube URL |
| POST | `/api/downloads/start` | Start download |
| GET | `/api/downloads/history` | Get download history |
| DELETE | `/api/downloads/history/{id}` | Delete history item |
| DELETE | `/api/downloads/history` | Clear all history |
| GET | `/api/downloads/file/{id}/{filename}` | Serve downloaded file |
| GET | `/health` | Health check |

---

## License

MIT — Personal use only. Respect YouTube's Terms of Service.
