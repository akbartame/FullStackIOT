import type { CSSProperties } from 'react'

export interface DeviceStatusBadgeProps {
  status: 'online' | 'stale' | 'offline' | 'waiting'
  className?: string
  style?: CSSProperties
}

/**
 * Small status badge showing device connection status
 * - ONLINE: bright green (< 15s since last reading)
 * - STALE: yellow (15-60s since last reading)
 * - OFFLINE: red (> 60s since last reading)
 * - WAITING: gray (initial load state)
 */
export const DeviceStatusBadge = ({ status, className = '', style = {} }: DeviceStatusBadgeProps) => {
  const statusConfig = {
    online: {
      label: 'ONLINE',
      bg: 'rgba(34, 197, 94, 0.1)',
      color: 'var(--green)',
      border: 'rgba(34, 197, 94, 0.2)',
    },
    stale: {
      label: 'STALE',
      bg: 'rgba(234, 179, 8, 0.1)',
      color: 'var(--yellow)',
      border: 'rgba(234, 179, 8, 0.2)',
    },
    offline: {
      label: 'OFFLINE',
      bg: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--red)',
      border: 'rgba(239, 68, 68, 0.2)',
    },
    waiting: {
      label: 'WAITING',
      bg: 'rgba(107, 114, 128, 0.1)',
      color: 'var(--text-secondary)',
      border: 'rgba(107, 114, 128, 0.2)',
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        fontWeight: 600,
        padding: '3px 8px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '2px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'inline-block',
        ...style,
      }}
    >
      {config.label}
    </div>
  )
}

export default DeviceStatusBadge
