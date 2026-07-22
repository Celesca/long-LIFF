# Backend deployment on a Linux VPS

The frontend runs separately with Vite. Docker Compose starts only PostgreSQL, MinIO, the FastAPI backend, and the image-cache worker.

## 1. Configure the VPS

From the repository root on the VPS:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Set these values in the root `.env`:

```dotenv
POSTGRES_DB=long_liff
POSTGRES_USER=long_liff
POSTGRES_PASSWORD=replace-with-a-long-url-safe-secret
MINIO_ACCESS_KEY=longliff
MINIO_SECRET_KEY=replace-with-another-long-secret
CORS_ORIGINS=http://localhost:5173
```

`CORS_ORIGINS` must contain the exact frontend origins, separated by commas without spaces. Add the production frontend origin when one exists, for example `https://app.example.com`.

Set optional AI configuration in `backend/.env`:

```dotenv
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=LONG LIFF Travel
```

Make sure `data/places.json` exists, then start and verify the stack:

```bash
docker compose up -d
docker compose ps
curl http://127.0.0.1:8000/api/health
```

The Compose ports bind to `127.0.0.1`, so PostgreSQL, MinIO, and Uvicorn are not directly exposed to the internet.

## 2. Publish the API through Nginx

On Ubuntu or Debian:

```bash
sudo apt update
sudo apt install -y nginx
sudo cp deploy/nginx-long-api.conf /etc/nginx/sites-available/long-api
sudo ln -s /etc/nginx/sites-available/long-api /etc/nginx/sites-enabled/long-api
```

Disable the packaged default site if it is still enabled because this repository's template is the default server:

```bash
sudo unlink /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Allow SSH and Nginx through the VPS firewall, but do not open ports 5432, 8000, 9000, or 9001 publicly. The API will be available at `http://VPS_PUBLIC_IP/api/health`.

For a production LIFF deployment, point a domain such as `api.example.com` at the VPS, replace `server_name _` in the Nginx file, and configure a TLS certificate. The frontend should then use `https://api.example.com`.

## 3. Configure the local Vite frontend

In the frontend checkout on the development computer, create `.env`:

```dotenv
VITE_API_URL=http://VPS_PUBLIC_IP
VITE_LIFF_ID=
```

Restart Vite after editing the file:

```bash
npm run dev
```

Use `VITE_API_URL=https://api.example.com` when the API has HTTPS. An HTTPS frontend cannot call an HTTP API because browsers block mixed content.

## Direct-port alternative

For a temporary test without Nginx, change the backend port mapping in `docker-compose.yml` from `127.0.0.1:8000:8000` to `8000:8000`, allow TCP port 8000 in the firewall, and use `VITE_API_URL=http://VPS_PUBLIC_IP:8000`. Do not expose PostgreSQL or MinIO. Nginx with HTTPS is the recommended production setup.
