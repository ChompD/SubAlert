// A plain full-page message for the moment before the app knows who you are.
// role="status" makes screen readers announce it without moving focus.
export default function PageStatus({ children }) {
  return (
    <p
      role="status"
      style={{
        padding: 'var(--space-4) var(--space-2)',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
      }}
    >
      {children}
    </p>
  )
}
