// src/config/index.js
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

if (!fs.existsSync(envPath)) {
  throw new Error(
    `Missing .env file at ${envPath}. Copy .env.example to .env and configure it before running.`
  );
}

const result = dotenv.config({ path: envPath });
if (result.error) {
  throw result.error;
}

// ── Broker ────────────────────────────────────────────────
export const BROKER = {
  host:     process.env.MQTT_HOST      || '192.168.1.12',
  port:     parseInt(process.env.MQTT_PORT) || 1883,
  username: process.env.MQTT_USERNAME  || 'akbartame',
  password: process.env.MQTT_PASSWORD  || '1234',
  clientId: process.env.MQTT_CLIENT_ID || `fsiot-backend-${Date.now()}`,
};

// ── Topic pattern ─────────────────────────────────────────
// Subscribe to everything under fsiot/# and let the
// subscriber route messages by topic structure at runtime.
// No device registry needed.
export const TOPICS = {
  subscribeAll:    'fsiot/#',
  sensorDetail:    (deviceId) => `fsiot/${deviceId}/sensors/detail`,
  command:         (deviceId) => `fsiot/${deviceId}/command`,
  wifiConfig:      (deviceId) => `fsiot/${deviceId}/device/wifi-config`,
};

// ── Topic parser ──────────────────────────────────────────
// Breaks an incoming topic string into its parts.
// Returns null if the topic doesn't match expected structure.
//
// fsiot/{deviceId}/sensors/detail  → { deviceId, type: 'sensorDetail' }
// fsiot/{deviceId}/command         → { deviceId, type: 'command' }
// fsiot/{deviceId}/device/wifi-config → { deviceId, type: 'wifiConfig' }
export function parseTopic(topic) {
  const parts = topic.split('/');
  if (parts[0] !== 'fsiot' || parts.length < 3) return null;

  const deviceId = parts[1];

  if (parts[2] === 'sensors' && parts[3] === 'detail')
    return { deviceId, type: 'sensorDetail' };

  if (parts[2] === 'command')
    return { deviceId, type: 'command' };

  if (parts[2] === 'device' && parts[3] === 'wifi-config')
    return { deviceId, type: 'wifiConfig' };

  return { deviceId, type: 'unknown' };
}

// -- Allowed Device IDs ──────────────────────────────────────────────
// For simplicity, we allow any device ID that starts with this prefix.
export const ALLOWED_DEVICE_PREFIX = process.env.ALLOWED_DEVICE_PREFIX;


// ── Database ──────────────────────────────────────────────
export const DB = {
  path: process.env.DB_PATH || './data/fsiot.db',
};

// ── API Server ────────────────────────────────────────────
export const SERVER = {
  port: parseInt(process.env.API_PORT) || 3000,
};

// ── Validation thresholds ─────────────────────────────────
export const VALIDATION = {
  dht11InvalidValue: -999.0,
  gasPpmMinValid:    0,
  r0InvalidValues:   [Infinity, 0],
};