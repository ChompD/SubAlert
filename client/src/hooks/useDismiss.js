import { useEffect } from 'react'

// Closes a small pop-up menu when you click outside it or press Escape, the
// way every menu on the web behaves. Shared by UserMenu and the "..." menu on
// each subscription row, so the behaviour is written once.
export default function useDismiss(ref, open, close) {
  useEffect(() => {
    if (!open) return

    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) close()
    }
    function handleKey(event) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [ref, open, close])
}
