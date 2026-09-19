import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DemoNotice from './components/DemoNotice.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import StyleguidePage from './pages/StyleguidePage.jsx'

// Every screen in the app and the URL it lives at (document 2, Step A).
//
// basename: on GitHub Pages the site lives at /SubAlert/, not /, and Vite
// exposes that as import.meta.env.BASE_URL. Without it every route would miss.
// Refreshing on /SubAlert/login still works because the build copies
// index.html to 404.html, which Pages serves for any unknown path.
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <DemoNotice />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Every design-system component on one page. Development only:
            import.meta.env.DEV is false in the build GitHub Pages serves. */}
        {import.meta.env.DEV && <Route path="/styleguide" element={<StyleguidePage />} />}
        {/* Any other URL, for example a mistyped one, goes home. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
