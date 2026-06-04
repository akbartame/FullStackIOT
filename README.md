# FullStackIOT

This repository contains the FullStackIOT backend (Node.js) and ESP device firmware (PlatformIO). This README focuses on production deployment using Docker Compose on an x86_64 Linux server.

**Goal:** Run the backend as a container on your Linux server with a highly optimized SQLite database, automated data aggregation pipelines, and an HTTP API exposed on port 3000.

## 🚀 Key Features
- **High-Throughput MQTT Ingestion:** Configured with SQLite WAL mode to handle concurrent writes and heavy data exports without locking.
- **Automated Data Roll-up:** Built-in cron job to aggregate 5-second interval data into 5-minute averages.
- **Memory-Safe Data Export:** Stream-based API to export millions of rows into CSV/ZIP formats without blocking the Node.js Event Loop.
- **Parquet Cold Storage:** Standalone monthly archiving system to compress old data into column-oriented Parquet files and safely prune the active SQLite database.

## 🏗️ Architecture Overview

The system is designed to handle high-frequency IoT telemetry while maintaining responsive APIs and efficient storage.

1. **Data Ingestion (MQTT to SQLite):**
   - ESP devices publish sensor data (e.g., every 5 seconds) to an external MQTT Broker.
   - The Node.js MQTT Subscriber listens to these topics and inserts raw data into SQLite.
   - **WAL (Write-Ahead Logging) Mode** is enabled in SQLite to ensure that heavy read operations (like large CSV exports) do not block continuous write operations.

2. **Real-Time & Historical APIs (Express.js):**
   - The HTTP Server provides endpoints for frontend dashboards to fetch the latest readings, device status, and historical charts.
   - **Streaming Exports:** Large data exports (e.g., 7-day raw data) are streamed directly from the database to a compressed `.zip` HTTP response, keeping server memory (RAM) footprint extremely low.

3. **Data Aggregation (Roll-up Pipeline):**
   - An internal Node.js cron job runs every 5 minutes. It calculates the average of all valid sensor readings within that window and stores them in a dedicated aggregation table (`sensor_data_5m_agg`). This enables fast, lightweight queries for long-term trends.

4. **Cold Storage (Parquet Archiver):**
   - To prevent database bloat, a standalone Node.js script is scheduled to run monthly. It extracts the previous month's raw data, converts it into highly compressed **Parquet files** (partitioned by `year=YYYY/month=MM`), and safely prunes the old rows from SQLite via chunked deletion.

## 📂 Contents
- **backend/** — Node.js service (MQTT subscriber, HTTP API, Cron Jobs, SQLite persistence)
- **frontend/** — React dashboard (not part of Docker deployment)
- **PlatformIO/** — Embedded firmware for the ESP device (not part of Docker deployment)

*Important: This guide assumes you already have a running MQTT broker (external to this compose) and Docker + Docker Compose installed on the server.*

## 🛠️ Quick Start (Production)

1. **Copy and configure environment file**
	Create a `.env` for the backend by copying the example:
	```bash
	cp backend/.env.example backend/.env
	```

	Edit `backend/.env` and set your MQTT broker host, credentials, and API config. Ensure `API_BIND_ADDR` is set to `0.0.0.0`.
	

2. **Prepare Persistence Directories**
	Ensure the `data` and `parquet` directories exist on the host to persist the database and cold storage archives:
	```bash
	mkdir -p backend/data
	mkdir -p backend/parquet

	```


3. **Build and start with Docker Compose:**
	```bash
	docker-compose build
	docker-compose up -d

	```


4. **Verify service is running and healthy:**
	```bash
	docker-compose logs -f backend
	curl http://localhost:3000/health

	```



## 📡 REST API Endpoints

### Data & Export API

* `GET /devices` — List all known devices, last seen timestamps, and reading counts.
* `GET /sensors/latest?deviceId=DEVICE` — Get the single most-recent reading.
* `GET /sensors/history?deviceId=DEVICE&from=TS&to=TS` — Query historical raw data.
* `POST /api/export/raw` — Export raw 7-day data (Streams a `.zip` containing `.csv` per device).
* Body: `{ "deviceIds": ["DEVICE_1"], "startTime": 1718000000, "endTime": 1718600000 }`


* `GET /api/export/aggregated` — Export monthly 5-minute aggregated data.

### Command & Control API

* `POST /wifi/open` — Open device wifi portal. Body: `{ "deviceId": "DEVICE" }`
* `POST /wifi/close` — Close device wifi portal. Body: `{ "deviceId": "DEVICE" }`
* `POST /command` — Send arbitrary command. Body: `{ "deviceId": "DEVICE", "payload": "cmd" }`
* `GET /health` — Health check status.

## ⚙️ Background Jobs & Maintenance

### 1. 5-Minute Aggregator (Internal)

The backend runs an internal cron job (`node-cron`) every 5 minutes. It calculates the average of all valid sensor readings and inserts them into the `sensor_data_5m_agg` table. **No manual intervention is required.**

### 2. Monthly Parquet Archiver (External)

To prevent the SQLite database from bloating, older data should be converted to `.parquet` format and deleted from the main database. This is a CPU-intensive task designed to run as a **standalone script** so it doesn't block MQTT ingestion.
Run this script manually or via OS-level `crontab` at the start of every month:

```bash
# Example running locally or inside the container:
npm run archive:monthly

```

*Files will be saved in `backend/parquet/year=YYYY/month=MM/device.parquet`.*

## 💾 Data Persistence & Backups

Data is persisted on the host in two locations:

1. Active Database: `./backend/data/fsiot.db`
2. Cold Storage: `./backend/parquet/`

To create a backup of the active database safely:

```bash
sqlite3 backend/data/fsiot.db ".backup 'backups/fsiot.db.$(date +%F_%T)'"

```

## 🔒 Security Notes

* The HTTP control API can send commands to devices — protect access with firewall rules, private networks, or reverse proxy + authentication.
* Keep your MQTT broker secured with strong credentials.

