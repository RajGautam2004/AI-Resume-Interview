export function LoadingSpinner({ message = 'Loading workspace...' }) {
  return (
    <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4">
      <div className="surface-panel rounded-[1.8rem] px-10 py-9 text-center">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-2"
          style={{ borderColor: 'rgba(var(--primary-rgb), 0.28)', borderTopColor: 'var(--primary)' }}
        />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
