import { useState } from 'react'

const RANGES = [
  { label: '1H',  seconds: 3600 },
  { label: '6H',  seconds: 21600 },
  { label: '24H', seconds: 86400 },
  { label: '7D',  seconds: 604800 },
]

export default function History() {
  const [activeRange, setActiveRange] = useState('24H')
  const [activeMetric, setActiveMetric] = useState('temperature_c')

  const METRICS = [
    { key: 'temperature_c', label: 'TEMPERATURE', unit: '°C', color: '#f5a623' },
    { key: 'humidity',      label: 'HUMIDITY',    unit: '%',  color: '#38bdf8' },
    { key: 'gas_ppm',       label: 'GAS PPM',     unit: 'ppm', color: '#a78bfa' },
  ]

  return (
    <div className="page-enter" style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.15em',
          marginBottom: '6px',
        }}>
          HISTORICAL DATA
        </div>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          History
        </h1>
      </div>

      {/* Controls row */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>

        {/* Device selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
          }}>DEVICE</label>
          <select style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            padding: '8px 12px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '200px',
          }}>
            <option value="">— select device —</option>
          </select>
        </div>

        {/* Time range */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
          }}>TIME RANGE</label>
          <div style={{ display: 'flex', gap: '1px' }}>
            {RANGES.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveRange(label)}
                style={{
                  padding: '8px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                  border: '1px solid var(--border)',
                  background: activeRange === label ? 'var(--accent)' : 'var(--bg-surface)',
                  color: activeRange === label ? '#000' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Metric tabs */}
      <div style={{ display: 'flex', gap: '1px', marginBottom: '16px' }}>
        {METRICS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveMetric(key)}
            style={{
              padding: '8px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.1em',
              border: '1px solid var(--border)',
              borderBottom: activeMetric === key ? `2px solid ${color}` : '1px solid var(--border)',
              background: activeMetric === key ? 'var(--bg-raised)' : 'var(--bg-surface)',
              color: activeMetric === key ? color : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart area placeholder */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        height: '360px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
        }}>
          CHART AREA
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          opacity: 0.5,
        }}>
          select a device to load data
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px',
        marginTop: '1px',
        background: 'var(--border)',
      }}>
        {['MIN', 'MAX', 'AVG', 'READINGS'].map((stat) => (
          <div key={stat} style={{
            background: 'var(--bg-surface)',
            padding: '14px 20px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              marginBottom: '6px',
            }}>{stat}</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}>—</div>
          </div>
        ))}
      </div>

    </div>
  )
}