import { useState } from 'react'
import { Typography } from '../components/Typography'
import { cn } from '../utils/cn'

export default function Devices() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)

  return (
    <div className="animate-fade-up p-5 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <Typography variant="caption" className="mb-1.5 block">
          DEVICE MANAGEMENT
        </Typography>
        <Typography variant="h1">
          Devices
        </Typography>
      </div>

      {/* Main Layout: Stack on mobile (Control first, then Table), Grid on desktop */}
      <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-4">

        {/* Device table */}
        <div className="border border-border-subtle bg-surface">

          {/* Table header (Hidden on very small screens if needed, but kept here for now) */}
          <div className="hidden border-b border-border-subtle bg-raised px-5 py-3 sm:grid sm:grid-cols-[1fr_120px_100px_80px]">
            {['DEVICE ID', 'LAST SEEN', 'READINGS', 'STATUS'].map((col) => (
              <Typography key={col} variant="caption">
                {col}
              </Typography>
            ))}
          </div>

          {/* Table body / Placeholder row */}
          <div
            className={cn(
              "grid cursor-pointer grid-cols-2 gap-y-3 border-b border-border-subtle px-5 py-4 transition-colors sm:grid-cols-[1fr_120px_100px_80px] sm:gap-y-0",
              selectedDevice === 'placeholder'
                ? "bg-accent/5"
                : "bg-transparent hover:bg-raised"
            )}
            onClick={() => setSelectedDevice('placeholder')}
          >
            {/* Mobile labels added implicitly through order/layout, but keeping it simple like the original for now */}
            <div className="font-mono text-[13px] text-text-primary">
              <span className="mb-1 block text-[9px] text-text-muted sm:hidden">DEVICE ID</span>
              —
            </div>
            <div className="font-mono text-[12px] text-text-secondary">
              <span className="mb-1 block text-[9px] text-text-muted sm:hidden">LAST SEEN</span>
              —
            </div>
            <div className="font-mono text-[12px] text-text-secondary">
              <span className="mb-1 block text-[9px] text-text-muted sm:hidden">READINGS</span>
              —
            </div>
            <div>
              <span className="mb-1 block text-[9px] text-text-muted sm:hidden">STATUS</span>
              <div className="inline-block border border-border-subtle bg-[#4a4a60]/30 px-2 py-0.5 font-mono text-[10px] text-text-muted">
                —
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="py-10 text-center font-mono text-[11px] text-text-muted">
            no devices found — waiting for data
          </div>

        </div>

        {/* Control panel */}
        <div className="border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle bg-raised px-4 py-3">
            <Typography variant="caption">DEVICE CONTROL</Typography>
          </div>

          <div className="p-4 sm:p-5">

            {/* Selected device */}
            <div className="mb-5">
              <Typography variant="caption" className="mb-1.5 block">SELECTED</Typography>
              <div className={cn(
                "min-h-5 font-mono text-[13px]",
                selectedDevice ? "text-accent" : "text-text-muted"
              )}>
                {selectedDevice ?? '— none —'}
              </div>
            </div>

            {/* WiFi portal controls */}
            <div className="mb-5">
              <Typography variant="caption" className="mb-2.5 block">WIFI PORTAL</Typography>
              <div className="flex flex-col gap-2">
                <button
                  disabled={!selectedDevice}
                  className={cn(
                    "border px-4 py-2.5 text-left font-mono text-[11px] tracking-widest transition-colors",
                    selectedDevice
                      ? "cursor-pointer border-accent bg-transparent text-accent hover:bg-accent/10"
                      : "cursor-not-allowed border-border-subtle bg-transparent text-text-muted"
                  )}
                >
                  ▶ OPEN PORTAL
                </button>
                <button
                  disabled={!selectedDevice}
                  className={cn(
                    "border px-4 py-2.5 text-left font-mono text-[11px] tracking-widest transition-colors",
                    selectedDevice
                      ? "cursor-pointer border-border-bright bg-transparent text-text-secondary hover:text-text-primary"
                      : "cursor-not-allowed border-border-subtle bg-transparent text-text-muted"
                  )}
                >
                  ■ CLOSE PORTAL
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-5 border-t border-border-subtle" />

            {/* Info */}
            <div className="font-mono text-[10px] leading-relaxed text-text-muted">
              SELECT A DEVICE FROM THE TABLE TO ENABLE CONTROLS
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}