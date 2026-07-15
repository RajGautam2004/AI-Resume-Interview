import {
  AlertTriangle,
  Eye,
  Shield,
  Users
} from 'lucide-react';

function StatusPill({ modelStatus }) {
  const statusMeta = {
    active: {
      label: 'Monitoring Running',
      color: 'var(--success)',
      bg: 'rgba(var(--success-rgb),0.12)',
      border: 'rgba(var(--success-rgb),0.24)'
    },
    loading: {
      label: 'Starting Monitor',
      color: 'var(--warning)',
      bg: 'rgba(var(--warning-rgb),0.12)',
      border: 'rgba(var(--warning-rgb),0.24)'
    },
    error: {
      label: 'Monitoring Issue',
      color: 'var(--destructive)',
      bg: 'rgba(239,82,95,0.12)',
      border: 'rgba(239,82,95,0.24)'
    },
    idle: {
      label: 'Monitoring Paused',
      color: 'var(--muted-foreground)',
      bg: 'rgba(var(--foreground-rgb),0.06)',
      border: 'rgba(var(--foreground-rgb),0.12)'
    }
  };

  const meta = statusMeta[modelStatus] || statusMeta.idle;

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
    >
      <Shield className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

export function ProctoringPanel({
  modelStatus,
  analysis,
  recentEvents,
  counts,
  queueStats
}) {
  return (
    <div className="surface-panel-soft flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Interview Proctoring
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Browser and webcam checks recorded during the secure interview session, including tab switches, face visibility, and camera positioning.
          </p>
        </div>
        <StatusPill modelStatus={modelStatus} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="metric-tile rounded-[1.3rem] p-4">
          <div className="flex items-center gap-2 text-[var(--info)]">
            <Users className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Faces</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-foreground">{analysis.faceCount || 0}</p>
        </div>

        <div className="metric-tile rounded-[1.3rem] p-4">
          <div className="flex items-center gap-2 text-[var(--warning)]">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Head Direction</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-foreground">{analysis.lookingDirection || 'CENTER'}</p>
        </div>

        <div className="metric-tile rounded-[1.3rem] p-4">
          <div className="flex items-center gap-2 text-[var(--destructive)]">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Alerts</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-foreground">{counts.total}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { label: 'Critical', value: counts.critical, color: 'var(--destructive)', bg: 'rgba(239,82,95,0.12)', border: 'rgba(239,82,95,0.24)' },
          { label: 'Warning', value: counts.warning, color: 'var(--warning)', bg: 'rgba(var(--warning-rgb),0.12)', border: 'rgba(var(--warning-rgb),0.24)' },
          { label: 'Pending Sync', value: queueStats.queued, color: 'var(--info)', bg: 'rgba(var(--info-rgb),0.12)', border: 'rgba(var(--info-rgb),0.24)' }
        ].map((item) => (
          <span
            key={item.label}
            className="inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ color: item.color, background: item.bg, borderColor: item.border }}
          >
            {item.label}: {item.value}
          </span>
        ))}
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col rounded-[1.5rem] border border-white/8 bg-white/4 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Recent Events
        </p>

        {recentEvents.length === 0 ? (
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            No proctoring events have been stored for this session yet.
          </p>
        ) : (
          <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {recentEvents.map((event, index) => (
              <div
                key={`${event.eventType}-${event.timestamp}-${index}`}
                className="rounded-[1.1rem] border border-white/8 bg-black/10 px-3 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{event.eventType.replaceAll('_', ' ')}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {event.message && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
