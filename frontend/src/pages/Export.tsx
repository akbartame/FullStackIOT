import { useState, useCallback } from 'react'
import { useDevices } from '../hooks/useDevices'
import { exportRawDataAPI } from '../api'
import { triggerFileDownload } from '../utils/download'

const pad2 = (v: number) => String(v).padStart(2, '0')
const formatDateTimeLocal = (seconds: number) => {
  const d = new Date(seconds * 1000)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
const parseDateTimeLocal = (v: string) => Math.floor(new Date(v).getTime() / 1000)

const PRESETS: { label: string; seconds: number }[] = [
  { label: '1H', seconds: 3600 },
  { label: '6H', seconds: 6 * 3600 },
  { label: '24H', seconds: 24 * 3600 },
  { label: '7D', seconds: 7 * 24 * 3600 },
]

const MAX_RAW_EXPORT_SECONDS = 7 * 24 * 3600

export default function Export() {
  const { devices, loading: devicesLoading } = useDevices()

  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number>(() => Math.floor(Date.now() / 1000) - 24 * 3600)
  const [endTime, setEndTime] = useState<number>(() => Math.floor(Date.now() / 1000))
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const isAllSelected = devices.length > 0 && selectedDevices.length === devices.length

  const applyPreset = (seconds: number) => {
    // Apply preset relative to the current `endTime` state to avoid impure calls at render
    setStartTime(prev => prev ? endTime - seconds : endTime - seconds)
    setActivePreset(seconds)
  }

  const handleExportRaw = useCallback(async () => {
    if (selectedDevices.length === 0) {
      setError('Pilih setidaknya satu perangkat.')
      return
    }
    if (endTime <= startTime) {
      setError('Tanggal akhir harus lebih besar dari tanggal awal.')
      return
    }
    if (endTime - startTime > MAX_RAW_EXPORT_SECONDS) {
      setError('Rentang RAW maksimal 7 hari. Gunakan agregasi untuk periode lebih panjang.')
      return
    }

    setIsExporting(true)
    setError(null)
    try {
      const blob = await exportRawDataAPI(selectedDevices, startTime, endTime)
      triggerFileDownload(blob, `fsiot_export_raw_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`)
    } catch (err) {
      console.error('Export failed', err)
      setError(err instanceof Error ? err.message : 'Gagal mengekspor data.')
    } finally {
      setIsExporting(false)
    }
  }, [selectedDevices, startTime, endTime])

  const handleToggleSelect = useCallback((deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId) 
        : [...prev, deviceId]
    )
  }, [])

  return (
    <div className="page-enter" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 6 }}>EXPORT DATA</div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Export</h1>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260 }}>
          <label className="label">DEVICES</label>
          <div style={{ 
            display: 'flex', flexDirection: 'column', gap: 8, 
            background: 'var(--bg-surface)', border: '1px solid var(--border)', 
            padding: '8px', minHeight: '120px', maxHeight: '200px' 
          }}>
            {/* Kolom Input Pencarian */}
            <input 
              type="text" 
              placeholder="Cari device..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ 
                fontFamily: 'var(--font-mono)', fontSize: 13, 
                padding: '4px 8px', background: 'transparent', 
                color: 'var(--text-primary)', border: '1px solid var(--border)',
                outline: 'none'
              }}
            />
            
            {/* Daftar Device yang difilter */}
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {devices
                .filter(d => d.device_id.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(d => {
                  const isSelected = selectedDevices.includes(d.device_id)
                  return (
                    <div 
                      key={d.device_id}
                      onClick={() => handleToggleSelect(d.device_id)}
                      style={{ 
                        padding: '2px 6px', 
                        cursor: 'pointer', 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: 13,
                        // Jika terpilih, gunakan warna accent, jika tidak biarkan transparan
                        background: isSelected ? 'var(--accent)' : 'transparent',
                        color: isSelected ? '#000' : 'var(--text-primary)',
                        borderRadius: '1px',
                        userSelect: 'none' // Mencegah teks ter-highlight biru saat diklik cepat
                      }}
                    >
                      {d.device_id}
                    </div>
                  )
                })}
                
                {/* Pesan jika pencarian tidak menemukan hasil */}
                {devices.filter(d => d.device_id.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', padding: '4px 8px' }}>
                    Tidak ada hasil.
                  </div>
                )}
            </div>
          </div>
          <div 
            onClick={() => {
              if (isAllSelected) {
                setSelectedDevices([]);
              } else {
                const allValidDeviceIds = devices.map(d => d.device_id).filter(Boolean);
                setSelectedDevices(allValidDeviceIds);
              }
            }}
            style={{
              fontFamily: 'var(--font-mono)', 
              fontSize: 11, 
              color: isAllSelected ? 'var(--text-muted)' : 'var(--accent)', 
              cursor: 'pointer',
              userSelect: 'none',
              background: 'var(--bg-surface)',
              marginTop: 4,
              maxWidth: 'fit-content',
              padding: '4px 8px',
              border: '1px solid var(--border)',
            }}
          >
            {isAllSelected ? 'Unselect All' : 'Select All'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>PRESET</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PRESETS.map(p => (
              <button 
                key={p.label} 
                onClick={() => applyPreset(p.seconds)} 
                style={{ 
                    padding: '8px 12px', 
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    background: activePreset === p.seconds ? 'var(--accent)' : 'var(--bg-surface)',
                    color: activePreset === p.seconds ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: 10, 
              color: 'var(--text-muted)' 
              }}
            >MANUAL RANGE
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="datetime-local" 
              className="datetime-input"
              value={formatDateTimeLocal(startTime)} 
              onChange={e => {
                setStartTime(parseDateTimeLocal(e.target.value))
                setActivePreset(null) // Clear preset selection when manually changing time
              }} 
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '8px 12px' }} />
            <input 
              type="datetime-local"
              className="datetime-input"
              value={formatDateTimeLocal(endTime)} 
              onChange={e => {
                setEndTime(parseDateTimeLocal(e.target.value))
                setActivePreset(null) // Clear preset selection when manually changing time
              }} 
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '8px 12px' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>Max RAW export range: 7 days.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>DOWNLOAD</label>
          <button onClick={handleExportRaw} disabled={isExporting || devicesLoading || selectedDevices.length === 0} style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-green)', color: 'var(--green)', border: '1px solid var(--border-green)', maxWidth: 'fit-content' }}>
            {isExporting ? 'Sedang Menyiapkan...' : '↓ RAW ZIP'}
          </button>
        </div>
      </div>
      <div className="bg-red-100 text-red-800 p-2 rounded mt-2 font-mono">
        {error}
      </div>
    </div>
  )
}
