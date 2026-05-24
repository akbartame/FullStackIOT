# FullStackIOT

This repository contains the FullStackIOT backend (Node.js) and ESP device firmware (PlatformIO). This README focuses on production deployment using Docker Compose on an x86_64 Linux server.

**Goal:** run the backend as a container on your Linux server with SQLite data persisted on the host and the HTTP control API exposed on port 3000.

**Contents**
- **backend/** — Node.js service (MQTT subscriber, HTTP control API, SQLite persistence)
- **PlatformIO/** — embedded firmware for the ESP device (not part of Docker deployment)

**Important:** This guide assumes you already have a running MQTT broker (external to this compose) and Docker + Docker Compose installed on the server.

**Quick start (production)**

1. Copy and configure environment file

	 - Create a `.env` for the backend by copying the example:

		 cp backend/.env.example backend/.env

	 - Edit `backend/.env` and set your MQTT broker host, credentials, and any other values. Ensure `API_BIND_ADDR` is set to `0.0.0.0` if you want remote access.

2. Ensure the `backend/data` directory exists on the host (for SQLite persistence):

	 mkdir -p backend/data

3. Build and start with Docker Compose:

	 docker-compose build
	 docker-compose up -d

4. Verify service is running and healthy:

	 docker ps
	 docker-compose logs -f backend
	 curl http://<server-ip>:3000/health

Configuration

- `backend/.env` contains runtime configuration used by the container. Key variables:
	- **MQTT_HOST**: address of your external MQTT broker
	- **MQTT_USERNAME / MQTT_PASSWORD**: broker auth
	- **API_PORT**: HTTP API port (default 3000)
	- **API_BIND_ADDR**: address to bind inside container (default 0.0.0.0)
	- **DB_PATH**: path to SQLite DB file (default ./data/fsiot.db)

REST API Endpoints

- POST /wifi/open — open device wifi portal
    - Body: `{ "deviceId": "DEVICE" }`
- POST /wifi/close — close device wifi portal
    - Body: `{ "deviceId": "DEVICE" }`
- POST /command — send arbitrary command to device
	- Body: `{ "deviceId": "DEVICE", "payload": "your-command-here" }`
- GET /health — health check (returns 200 OK when server responds)

Data persistence & backups

- SQLite DB is persisted on the host at `./backend/data/fsiot.db` (mounted into the container). Back up this file regularly.
- To create a backup:

	cp backend/data/fsiot.db backups/fsiot.db.$(date +%F_%T)

Logs & troubleshooting

- View logs: `docker-compose logs -f backend`
- Common issues:
	- Broker connection failures: verify `MQTT_HOST` and credentials in `backend/.env` and that the broker is reachable from the server.
	- Port conflicts: ensure port 3000 is available on the host.
	- Missing `.env`: the service will fail to start if `backend/.env` is missing.

Security notes

- The HTTP control API can send commands to devices — protect access with firewall rules, private networks, or reverse proxy + authentication. Keep your MQTT broker secured with strong credentials.

Further reading

- See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for additional deployment notes and PM2-based alternatives.


