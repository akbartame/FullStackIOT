import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getSensorHistory,
  handleApiError,
  type SensorReading,
} from '../api'
import { DEFAULT_HISTORY_LIMIT, DEFAULT_VALID_ONLY } from '../constant'

type Status = 'idle' | 'loading' | 'success' | 'error'

export interface UseHistoryParams {
  deviceId: string | null
  rangeSeconds: number       // e.g. 3600 = 1h, 86400 = 24h
  validOnly?: boolean
  limit?: number
}

export interface UseHistoryReturn {
  readings: SensorReading[]
  loading: boolean
  error: string | null
  status: Status
  refetch: () => void
}

export const useHistory = ({
  deviceId,
  rangeSeconds,
  validOnly = DEFAULT_VALID_ONLY,
  limit = DEFAULT_HISTORY_LIMIT,
}: UseHistoryParams): UseHistoryReturn => {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [status, setStatus]     = useState<Status>('idle')
  const [error, setError]       = useState<string | null>(null)

  // Use a ref-based trigger so refetch() causes a re-run without
  // adding it to the dependency array of useEffect (avoids infinite loops).
  const [tick, setTick] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const refetch = useCallback(() => {
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    // No device selected — reset to idle and bail out early.
    if (!deviceId) {
      setReadings([])
      setStatus('idle')
      setError(null)
      return
    }

    // Cancel any in-flight request before starting a new one.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const nowSeconds  = Math.floor(Date.now() / 1000)
    const fromSeconds = nowSeconds - rangeSeconds

    setStatus('loading')
    setError(null)

    getSensorHistory({
      deviceId,
      from:      fromSeconds,
      to:        nowSeconds,
      limit,
      validOnly,
    })
      .then(data => {
        if (controller.signal.aborted) return
        setReadings(data)
        setStatus('success')
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setError(handleApiError(err))
        setStatus('error')
      })

    return () => {
      controller.abort()
    }
  }, [deviceId, rangeSeconds, validOnly, limit, tick])

  return {
    readings,
    loading: status === 'loading',
    error,
    status,
    refetch,
  }
}

// ── Derived stats helpers ─────────────────────────────────

export type MetricKey = 'temperature_c' | 'humidity' | 'gas_ppm'

export interface MetricStats {
  min: number | null
  max: number | null
  avg: number | null
  count: number
}

/**
 * Compute min/max/avg for a given metric key over a readings array.
 * Null values in the data are excluded from calculations.
 */
export function computeStats(
  readings: SensorReading[],
  key: MetricKey
): MetricStats {
  const values = readings
    .map(r => r[key])
    .filter((v): v is number => v !== null && isFinite(v))

  if (values.length === 0) {
    return { min: null, max: null, avg: null, count: 0 }
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  return { min, max, avg, count: values.length }
}

/**
 * Transform raw readings into recharts-compatible data points.
 * Each point has a `time` (Unix seconds) and the value for the given metric.
 */
export interface ChartPoint {
  time: number   // Unix seconds — used as x-axis key
  value: number | null
}

export function toChartData(
  readings: SensorReading[],
  key: MetricKey
): ChartPoint[] {
  return readings.map(r => ({
    time:  r.received_at,
    value: r[key],
  }))
}