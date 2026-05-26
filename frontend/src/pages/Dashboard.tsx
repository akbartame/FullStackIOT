export default function Dashboard() {
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
          { label: 'DEVICES', value: '—', unit: 'total' },
          { label: 'ONLINE',  value: '—', unit: 'active' },
          { label: 'LAST UPDATE', value: '—', unit: 'ago' },
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '12px',
      }}>
        {/* Placeholder card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '4px',
              }}>DEVICE ID</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>—</div>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '3px 8px',
              background: 'rgba(34,197,94,0.1)',
              color: 'var(--green)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>WAITING</div>
          </div>

          {[
            { label: 'TEMPERATURE', value: '—', unit: '°C' },
            { label: 'HUMIDITY',    value: '—', unit: '%' },
            { label: 'GAS PPM',     value: '—', unit: 'ppm' },
          ].map(({ label, value, unit }) => (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '8px 0',
              borderTop: '1px solid var(--border)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>{label}</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '18px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}>
                {value}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '3px' }}>
                  {unit}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}