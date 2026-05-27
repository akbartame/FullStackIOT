import { useReducer, useEffect } from 'react'
import { getDevices, handleApiError, type Device } from '../api'

// ── State & actions ───────────────────────────────────────

interface State {
  devices:    Device[]
  resolvedId: number
  error:      string | null
}

type Action =
  | { type: 'FETCH_SUCCESS'; fetchId: number; payload: Device[] }
  | { type: 'FETCH_ERROR';   fetchId: number; payload: string   }

const initialState: State = {
  devices:    [],
  resolvedId: -1,   // -1 so fetchId=0 is immediately seen as "in flight"
  error:      null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return { devices: action.payload, resolvedId: action.fetchId, error: null }
    case 'FETCH_ERROR':
      return { ...state, resolvedId: action.fetchId, error: action.payload }
  }
}

// ── Hook ─────────────────────────────────────────────────

export interface UseDevicesReturn {
  devices: Device[]
  loading: boolean
  error:   string | null
  refetch: () => void
}

export const useDevices = (): UseDevicesReturn => {
  const [fetchId, bumpFetch] = useReducer((n: number) => n + 1, 0)
  const [state,   dispatch]  = useReducer(reducer, initialState)

  useEffect(() => {
    let cancelled = false
    const id = fetchId

    getDevices()
      .then(data => {
        if (cancelled) return
        dispatch({ type: 'FETCH_SUCCESS', fetchId: id, payload: data })
      })
      .catch(err => {
        if (cancelled) return
        dispatch({ type: 'FETCH_ERROR', fetchId: id, payload: handleApiError(err) })
      })

    return () => { cancelled = true }
  }, [fetchId])

  return {
    devices: state.devices,
    loading: fetchId !== state.resolvedId,
    error:   state.error,
    refetch: bumpFetch,
  }
}