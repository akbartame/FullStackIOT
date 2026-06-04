import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/',        label: 'DASHBOARD', icon: '⬡' },
  { to: '/history', label: 'HISTORY',   icon: '◈' },
  { to: '/devices', label: 'DEVICES',   icon: '◎' },
  { to: '/export',  label: 'EXPORT',    icon: '↓' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? '72px' : '200px',
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed
              ? 'center'
              : 'space-between',
          }}
        >
          {!collapsed && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.15em',
                  marginBottom: '4px',
                }}
              >
                SYSTEM
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  letterSpacing: '0.05em',
                }}
              >
                FSIOT
              </div>
            </div>
          )}

          <button
            onClick={() =>
              setCollapsed(prev => !prev)
            }
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            {collapsed ? '☰' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav
          style={{
            padding: '12px 0',
            flex: 1,
          }}
        >
          {NAV_ITEMS.map(
            ({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed
                    ? '12px 0'
                    : '12px 20px',
                  justifyContent: collapsed
                    ? 'center'
                    : 'flex-start',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textDecoration: 'none',
                  color: isActive
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                  background: isActive
                    ? 'rgba(245, 166, 35, 0.06)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <span
                  style={{
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </span>

                {!collapsed && label}
              </NavLink>
            )
          )}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed
                ? 'center'
                : 'flex-start',
              gap: '6px',
            }}
          >
            <span
              className="pulse-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--green)',
                display: 'inline-block',
              }}
            />

            {!collapsed && 'ONLINE'}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--bg-base)',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}