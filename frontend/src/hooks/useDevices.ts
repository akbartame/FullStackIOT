import { useState, useEffect, useCallback } from 'react'
import { getDevices, handleApiError, type Device } from '../api'

type Status = 'loading' | 'success' | 'error'

export interface UseDevicesReturn {
  devices:  Device[]
  loading:  boolean
  error:    string | null
  refetch:  () => void
}

/**
 * Fetches the device list once on mount (no polling — device list
 * changes infrequently). Call refetch() to manually reload.
 */
export const useDevices = (): UseDevicesReturn => {
  const [devices, setDevices] = useState<Device[]>([])
  const [status,  setStatus]  = useState<Status>('loading')
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false

    setStatus('loading')
    setError(null)

    getDevices()
      .then(data => {
        if (cancelled) return
        setDevices(data)
        setStatus('success')
      })
      .catch(err => {
        if (cancelled) return
        setError(handleApiError(err))
        setStatus('error')
      })

    return () => { cancelled = true }
  }, [tick])

  return {
    devices,
    loading: status === 'loading',
    error,
    refetch,
  }
}