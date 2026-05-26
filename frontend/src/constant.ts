// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// Polling & Device Thresholds
export const POLL_INTERVAL_MS = 5000
export const DEVICE_STALE_THRESHOLD_S = 15   // seconds — data is 15s old
export const DEVICE_OFFLINE_THRESHOLD_S = 60  // seconds — device offline if no data in 60s

// Sensor Reading Thresholds (acceptable ranges)
export const TEMP_MIN_C = 15
export const TEMP_MAX_C = 50
export const HUMIDITY_MIN = 20
export const HUMIDITY_MAX = 90
export const GAS_PPM_WARNING = 100  // above this = warning
export const MQ2_RATIO_THRESHOLD = 1.2  // MQ2 clean air ratio

// Chart Configuration
export const CHART_HEIGHT = 300
export const CHART_MARGIN = { top: 5, right: 20, bottom: 20, left: 0 }

// History Query Defaults
export const DEFAULT_HISTORY_LIMIT = 100
export const DEFAULT_VALID_ONLY = true