import { USING_MOCK_API } from '../api'

// Shown only while the simulated backend is switched on. It disappears by
// itself the moment you set VITE_USE_MOCK_API=false, because it reads the same
// variable the API layer does.
//
// Leave this in. A deployment that quietly pretends to have a server is the
// difference between a deliberate staging site and a submission hoping nobody
// checks.
export default function DemoNotice() {
  if (!USING_MOCK_API) return null

  // Always visible as one line; the full explanation is one tap away. On a
  // phone the complete text took a fifth of the screen above every page.
  return (
    <details className="demo-notice">
      <summary>
        <strong>Demo mode.</strong> Your data stays in this browser.{' '}
        <span className="demo-notice-more">More</span>
      </summary>
      <p>
        This deployment exists to show the interface. It runs on a{' '}
        <strong>simulated backend</strong>: everything you add is stored in your
        own browser, is shared with nobody, and disappears when you clear your
        browsing data. There is no server and no database behind this page. The
        full version runs against an Express API and a PostgreSQL database,
        deployed separately. See the README.
      </p>
    </details>
  )
}
