import { useState, useMemo } from 'react'
import { useHistory, computeStats, toChartData, type MetricKey } from '../hooks/useHistory'
import { SensorChart } from '../components/SensorChart'
import { useDevices } from '../hooks/useDevices'

// ── Constants ─────────────────────────────────────────────

const RANGES: { label: string; seconds: number }[] = [
  { label: '1H',  seconds: 3_600   },
  { label: '6H',  seconds: 21_600  },
  { label: '24H', seconds: 86_400  },
  { label: '7D',  seconds: 604_800 },
]

const METRICS: { key: MetricKey; label: string; color: string; unit: string }[] = [
  { key: 'temperature_c', label: 'TEMPERATURE', color: '#f5a623', unit: '°C'  },
  { key: 'humidity',      label: 'HUMIDITY',    color: '#38bdf8', unit: '%'   },
  { key: 'gas_ppm',       label: 'GAS PPM',     color: '#a78bfa', unit: 'ppm' },
]

// ── Helpers ───────────────────────────────────────────────

const fmt = (v: number | null, decimals: number, unit: string): string =>
  v !== null ? `${v.toFixed(decimals)} ${unit}` : '—'

// ── Component ─────────────────────────────────────────────

export default function History() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [activeRange, setActiveRange]       = useState<string>('24H')
  const [activeMetric, setActiveMetric]     = useState<MetricKey>('temperature_c')
  const [validOnly, setValidOnly]           = useState<boolean>(true)

  const rangeSeconds = RANGES.find(r => r.label === activeRange)?.seconds ?? 86_400
  const metricMeta   = METRICS.find(m => m.key === activeMetric)!

  // Load device list for the selector
  const { devices, loading: devicesLoading } = useDevices()

  // Load history data
  const { readings, loading, error, idle, refetch } = useHistory({
    deviceId:     selectedDevice,
    rangeSeconds,
    validOnly,
  })

  // Derived chart data and stats
  const chartData = useMemo(() => toChartData(readings, activeMetric), [readings, activeMetric])
  const stats     = useMemo(() => computeStats(readings, activeMetric), [readings, activeMetric])

  const decimals = activeMetric === 'gas_ppm' ? 1 : 1

  return (
    <div className="page-enter" style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '10px',
          color:         'var(--text-muted)',
          letterSpacing: '0.15em',
          marginBottom:  '6px',
        }}>
          HISTORICAL DATA
        </div>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   '24px',
          fontWeight: 600,
          color:      'var(--text-primary)',
          margin:     0,
        }}>
          History
        </h1>
      </div>

      {/* Controls row */}
      <div style={{
        display:     'flex',
        gap:         '16px',
        marginBottom:'24px',
        flexWrap:    'wrap',
        alignItems:  'flex-end',
      }}>

        {/* Device selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            color:         'var(--text-muted)',
            letterSpacing: '0.12em',
          }}>
            DEVICE
          </label>
          <select
            value={selectedDevice ?? ''}
            onChange={e => setSelectedDevice(e.target.value || null)}
            style={{
              background:  'var(--bg-surface)',
              border:      '1px solid var(--border)',
              color:       selectedDevice ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily:  'var(--font-mono)',
              fontSize:    '12px',
              padding:     '8px 12px',
              outline:     'none',
              cursor:      'pointer',
              minWidth:    '220px',
            }}
          >
            <option value="">— select device —</option>
            {devicesLoading && (
              <option disabled>loading...</option>
            )}
            {devices.map(d => (
              <option key={d.device_id} value={d.device_id}>
                {d.device_id}
              </option>
            ))}
          </select>
        </div>

        {/* Time range */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            color:         'var(--text-muted)',
            letterSpacing: '0.12em',
          }}>
            TIME RANGE
          </label>
          <div style={{ display: 'flex', gap: '1px' }}>
            {RANGES.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveRange(label)}
                style={{
                  padding:     '8px 14px',
                  fontFamily:  'var(--font-mono)',
                  fontSize:    '11px',
                  fontWeight:  500,
                  border:      '1px solid var(--border)',
                  background:  activeRange === label ? 'var(--accent)' : 'var(--bg-surface)',
                  color:       activeRange === label ? '#000' : 'var(--text-secondary)',
                  cursor:      'pointer',
                  transition:  'all 0.15s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Valid only toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            color:         'var(--text-muted)',
            letterSpacing: '0.12em',
          }}>
            FILTER
          </label>
          <button
            onClick={() => setValidOnly(v => !v)}
            style={{
              padding:     '8px 14px',
              fontFamily:  'var(--font-mono)',
              fontSize:    '11px',
              border:      `1px solid ${validOnly ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
              background:  validOnly ? 'rgba(34,197,94,0.08)' : 'var(--bg-surface)',
              color:       validOnly ? 'var(--green)' : 'var(--text-muted)',
              cursor:      'pointer',
              transition:  'all 0.15s ease',
              letterSpacing: '0.08em',
            }}
          >
            {validOnly ? '✓ VALID ONLY' : '  ALL DATA'}
          </button>
        </div>

        {/* Refetch button — only visible when a device is selected */}
        {selectedDevice && (
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              padding:     '8px 14px',
              fontFamily:  'var(--font-mono)',
              fontSize:    '11px',
              border:      '1px solid var(--border)',
              background:  'var(--bg-surface)',
              color:       loading ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor:      loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.08em',
              alignSelf:   'flex-end',
            }}
          >
            ↺ REFRESH
          </button>
        )}
      </div>

      {/* Metric tabs */}
      <div style={{ display: 'flex', gap: '1px', marginBottom: '0' }}>
        {METRICS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveMetric(key)}
            style={{
              padding:      '8px 20px',
              fontFamily:   'var(--font-mono)',
              fontSize:     '10px',
              letterSpacing:'0.1em',
              border:       '1px solid var(--border)',
              borderBottom: activeMetric === key
                ? `2px solid ${color}`
                : '1px solid var(--border)',
              background:   activeMetric === key
                ? 'var(--bg-raised)'
                : 'var(--bg-surface)',
              color:        activeMetric === key ? color : 'var(--text-muted)',
              cursor:       'pointer',
              transition:   'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background:   'rgba(239,68,68,0.1)',
          border:       '1px solid rgba(239,68,68,0.2)',
          color:        'var(--red)',
          padding:      '12px 16px',
          fontFamily:   'var(--font-mono)',
          fontSize:     '11px',
          marginTop:    '1px',
          marginBottom: '0',
          display:      'flex',
          justifyContent: 'space-between',
          alignItems:   'center',
        }}>
          <span>⚠ {error}</span>
          <button
            onClick={refetch}
            style={{
              background:  'var(--red)',
              border:      'none',
              color:       '#fff',
              padding:     '4px 10px',
              fontFamily:  'var(--font-mono)',
              fontSize:    '10px',
              cursor:      'pointer',
              letterSpacing: '0.08em',
            }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* Chart */}
      <SensorChart
        data={chartData}
        metric={activeMetric}
        rangeSeconds={rangeSeconds}
        loading={loading}
        idle={idle}
      />

      {/* Stats row */}
      <div style={{
        display:    'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:        '1px',
        marginTop:  '1px',
        background: 'var(--border)',
      }}>
        {[
          {
            label: 'MIN',
            value: fmt(stats.min, decimals, metricMeta.unit),
            color: stats.min !== null ? metricMeta.color : undefined,
          },
          {
            label: 'MAX',
            value: fmt(stats.max, decimals, metricMeta.unit),
            color: stats.max !== null ? metricMeta.color : undefined,
          },
          {
            label: 'AVG',
            value: fmt(stats.avg, decimals, metricMeta.unit),
            color: stats.avg !== null ? metricMeta.color : undefined,
          },
          {
            label: 'READINGS',
            value: stats.count > 0 ? `${stats.count}` : '—',
            color: stats.count > 0 ? 'var(--text-primary)' : undefined,
          },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg-surface)',
            padding:    '14px 20px',
          }}>
            <div style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '10px',
              color:         'var(--text-muted)',
              letterSpacing: '0.12em',
              marginBottom:  '6px',
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '20px',
              fontWeight: 500,
              color:      color ?? 'var(--text-muted)',
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Idle state — no device selected */}
      {!selectedDevice && (
        <div style={{
          marginTop:      '24px',
          padding:        '24px',
          textAlign:      'center',
          fontFamily:     'var(--font-mono)',
          fontSize:       '11px',
          color:          'var(--text-muted)',
          letterSpacing:  '0.08em',
          border:         '1px solid var(--border)',
          background:     'var(--bg-surface)',
        }}>
          SELECT A DEVICE ABOVE TO LOAD HISTORICAL DATA
        </div>
      )}

    </div>
  )
}