import { createContext, useContext, useEffect, useState } from 'react'

// Light or dark, available to every component through useTheme().
//
// There are two different things here, and mixing them up is the usual bug:
//   preference — what the user chose: 'system', 'light' or 'dark'. Saved.
//   resolved   — what is actually on screen: 'light' or 'dark'.
// With 'system' the resolved value follows the phone or laptop's own setting,
// and changes straight away if they switch it while the app is open.
//
// The resolved value is written to <html data-theme="…">, which is the only
// thing tokens.css looks at. Because this file resolves 'system' itself, the
// stylesheet needs one dark block instead of one for the setting and another
// for the media query.

const STORAGE_KEY = 'subalert:theme'
const ThemeContext = createContext(null)

const systemPrefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    // Private windows can refuse localStorage. Following the system is a fine
    // answer, and better than crashing the app over a colour.
    return 'system'
  }
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  // Listen while the app is open, so switching the laptop to dark at sunset
  // changes the app too, without a reload.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handle = (event) => setSystemDark(event.matches)
    media.addEventListener('change', handle)
    return () => media.removeEventListener('change', handle)
  }, [])

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
    // The browser's own chrome on a phone (the address bar) follows this.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolved === 'dark' ? '#12161B' : '#FFFFFF')
  }, [resolved])

  function setPreference(value) {
    setPreferenceState(value)
    try {
      if (value === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Not being able to remember the choice is not worth an error.
    }
  }

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}
