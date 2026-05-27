import { useLatest, getDeviceStatus } from '../hooks/useLatest'
import { SensorCard } from '../components/SensorCard'
import { getCurrentTimeSeconds } from '../api'

export default function Dashboard() {
  const { readings, loading, error, refetch } = useLatest()

  // Calculate summary stats
  const totalReadings = readings.length
  const onlineReadings = readings.filter(
    (r) => getDeviceStatus(r.received_at) === 'online'
  ).length
  const oldestReading =
    readings.length > 0
      ? Math.min(...readings.map((r) => getCurrentTimeSeconds() - r.received_at))
      : null

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
          LIVE MONITOR
        </div>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Dashboard
        </h1>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'DEVICES', value: loading ? '—' : totalReadings, unit: 'total' },
          { label: 'ONLINE',  value: loading ? '—' : onlineReadings, unit: 'active' },
          { label: 'LAST UPDATE', value: loading ? '—' : oldestReading ? `${oldestReading}s` : '—', unit: 'ago' },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '16px 20px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}>{label}</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--accent)',
              lineHeight: 1,
            }}>{value}</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Device cards placeholder */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        letterSpacing: '0.12em',
        marginBottom: '16px',
      }}>
        SENSOR READINGS
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--red)',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}>
          ⚠ {error}
          <button
            onClick={refetch}
            style={{
              marginLeft: '12px',
              padding: '4px 8px',
              background: 'var(--accent)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && readings.length === 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px',
        }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                padding: '20px',
                animation: 'pulse 2s infinite',
              }}
            >
              <div style={{ height: '200px', background: 'var(--border)', borderRadius: '2px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Cards Grid */}
      {!loading && readings.length === 0 && (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          No readings available. Backend may be offline or devices haven't reported yet.
        </div>
      )}

      {readings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px',
        }}>
          {readings.map((reading) => (
            <SensorCard key={reading.id} reading={reading} />
          ))}
        </div>
      )}

    </div>
  )
}