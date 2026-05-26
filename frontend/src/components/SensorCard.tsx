import type { CSSProperties } from 'react'
import type { SensorReading } from '../api'
import { DeviceStatusBadge } from './DeviceStatusBadge'
import { getDeviceStatus, getSensorHealth } from '../hooks/useLatest'
import { getCurrentTimeSeconds, secondsToDate } from '../api'

export interface SensorCardProps {
  reading: SensorReading
  className?: string
  style?: CSSProperties
}

/**
 * Card displaying a single sensor reading from a device
 * Shows device ID, status, and key sensor metrics
 * Color-codes values based on thresholds
 */
export const SensorCard = ({ reading, className = '', style = {} }: SensorCardProps) => {
  const deviceStatus = getDeviceStatus(reading.received_at)
  const sensorHealth = getSensorHealth(reading.is_valid)
  const readingAge = getCurrentTimeSeconds() - reading.received_at
  const readingTime = secondsToDate(reading.received_at)
  const readingTimeStr = readingTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // Color temperature based on range
  const getTempColor = (temp: number | null): string => {
    if (temp === null) return 'var(--text-muted)'
    if (temp < 18 || temp > 45) return 'var(--red)'
    if (temp < 20 || temp > 40) return 'var(--yellow)'
    return 'var(--green)'
  }

  // Color humidity based on range
  const getHumidityColor = (humidity: number | null): string => {
    if (humidity === null) return 'var(--text-muted)'
    if (humidity < 25 || humidity > 85) return 'var(--red)'
    if (humidity < 30 || humidity > 80) return 'var(--yellow)'
    return 'var(--green)'
  }

  // Color gas PPM based on threshold
  const getGasColor = (ppm: number | null): string => {
    if (ppm === null) return 'var(--text-muted)'
    if (ppm > 100) return 'var(--red)'
    if (ppm > 50) return 'var(--yellow)'
    return 'var(--green)'
  }

  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '20px',
        ...style,
      }}
    >
      {/* Header: Device ID + Status Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '4px',
            }}
          >
            DEVICE ID
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            {reading.device_id}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
            }}
          >
            {readingTimeStr} ({readingAge}s ago)
          </div>
        </div>
        <DeviceStatusBadge status={deviceStatus} />
      </div>

      {/* Sensor Health Indicator */}
      <div
        style={{
          marginBottom: '16px',
          padding: '8px 12px',
          background: sensorHealth === 'clean' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          border: `1px solid ${sensorHealth === 'clean' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          borderRadius: '2px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: sensorHealth === 'clean' ? 'var(--green)' : 'var(--red)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {sensorHealth === 'clean' ? '✓ VALID DATA' : '⚠ FLAGGED DATA'}
        </div>
      </div>

      {/* Sensor Readings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {/* Temperature */}
        <div
          style={{
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '4px',
            }}
          >
            TEMPERATURE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 600,
              color: getTempColor(reading.temperature_c),
            }}
          >
            {reading.temperature_c != null ? reading.temperature_c.toFixed(1) : '-'}°C
          </div>
        </div>

        {/* Humidity */}
        <div
          style={{
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '4px',
            }}
          >
            HUMIDITY
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 600,
              color: getHumidityColor(reading.humidity),
            }}
          >
            {reading.humidity != null ? reading.humidity.toFixed(1) : '-'}%
          </div>
        </div>

        {/* Gas PPM */}
        <div
          style={{
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '4px',
            }}
          >
            GAS PPM
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 600,
              color: getGasColor(reading.gas_ppm),
            }}
          >
            {reading.gas_ppm != null ? reading.gas_ppm.toFixed(0) : '-'}
          </div>
        </div>

        {/* MQ2 Ratio */}
        <div
          style={{
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginBottom: '4px',
            }}
          >
            MQ2 RATIO
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 600,
              color: reading.mq2_ratio != null && reading.mq2_ratio > 1.2 ? 'var(--green)' : 'var(--yellow)',
            }}
          >
            {reading.mq2_ratio != null ? reading.mq2_ratio.toFixed(2) : '-'}
          </div>
        </div>
      </div>

      {/* Footer: Metadata */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '10px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            UPTIME
          </span>
          <div style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
            {reading.device_uptime_ms != null ? `${(reading.device_uptime_ms / 1000 / 60 / 60).toFixed(2)}h` : '-'}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            MQ2 RS
          </span>
          <div style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
            {reading.mq2_rs_kohm != null ? reading.mq2_rs_kohm.toFixed(1) : '-'}kΩ
          </div>
        </div>
      </div>
    </div>
  )
}

export default SensorCard
