import { useState } from 'react'

export default function Devices() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

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
          DEVICE MANAGEMENT
        </div>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Devices
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>

        {/* Device table */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px 80px',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-raised)',
          }}>
            {['DEVICE ID', 'LAST SEEN', 'READINGS', 'STATUS'].map((col) => (
              <div key={col} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
              }}>{col}</div>
            ))}
          </div>

          {/* Placeholder row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px 80px',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            cursor: 'pointer',
            background: selectedDevice === 'placeholder'
              ? 'rgba(245,166,35,0.05)'
              : 'transparent',
            transition: 'background 0.15s ease',
          }}
            onClick={() => setSelectedDevice('placeholder')}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}>—</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>—</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>—</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              padding: '2px 7px',
              background: 'rgba(74,74,96,0.3)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              display: 'inline-block',
            }}>—</div>
          </div>

          {/* Empty state */}
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}>
            no devices found — waiting for data
          </div>

        </div>

        {/* Control panel */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-raised)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
            }}>DEVICE CONTROL</div>
          </div>

          <div style={{ padding: '20px 16px' }}>

            {/* Selected device */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                marginBottom: '6px',
              }}>SELECTED</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: selectedDevice ? 'var(--accent)' : 'var(--text-muted)',
                minHeight: '20px',
              }}>
                {selectedDevice ?? '— none —'}
              </div>
            </div>

            {/* WiFi portal controls */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                marginBottom: '10px',
              }}>WIFI PORTAL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  disabled={!selectedDevice}
                  style={{
                    padding: '10px 16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    border: '1px solid var(--accent)',
                    background: 'transparent',
                    color: selectedDevice ? 'var(--accent)' : 'var(--text-muted)',
                    borderColor: selectedDevice ? 'var(--accent)' : 'var(--border)',
                    cursor: selectedDevice ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  ▶ OPEN PORTAL
                </button>
                <button
                  disabled={!selectedDevice}
                  style={{
                    padding: '10px 16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: selectedDevice ? 'var(--text-secondary)' : 'var(--text-muted)',
                    borderColor: selectedDevice ? 'var(--border-bright)' : 'var(--border)',
                    cursor: selectedDevice ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  ■ CLOSE PORTAL
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border)', marginBottom: '20px' }} />

            {/* Info */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}>
              SELECT A DEVICE FROM THE TABLE TO ENABLE CONTROLS
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}