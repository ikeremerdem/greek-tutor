import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, Outlet, useParams, useNavigate } from 'react-router-dom'
import FilosLogo from './FilosLogo'
import { useTutor } from '../context/TutorContext'
import { useAuth } from '../context/AuthContext'
import { useIsAdmin } from '../hooks/useIsAdmin'


export default function Layout() {
  const { tutorId, targetLanguage } = useTutor()
  const { user, signOut } = useAuth()
  const isAdmin = useIsAdmin()
  const { tutorId: paramId } = useParams<{ tutorId: string }>()
  const navigate = useNavigate()
  const id = tutorId || paramId || ''
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const links = [
    { to: `/tutors/${id}/dashboard`, label: 'Dashboard' },
    { to: `/tutors/${id}/vocabulary`, label: 'Vocabulary' },
    { to: `/tutors/${id}/quiz/word`, label: 'Word Quiz' },
    { to: `/tutors/${id}/quiz/sentence`, label: 'Sentence Quiz' },
  ]

  return (
    <div className="min-h-screen bg-filos-marble">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/tutors')} className="flex items-center gap-3 hover:opacity-80 transition">
              <FilosLogo size={38} />
              <div className="leading-tight text-left">
                <h1 className="text-xl font-bold tracking-tight text-filos-primary font-headline">Filos</h1>
                <p className="text-filos-accent text-xs italic">Your {targetLanguage} companion</p>
              </div>
            </button>
          </div>
          <nav className="flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-filos-primary bg-filos-marble font-semibold'
                      : 'text-gray-500 hover:text-filos-primary hover:bg-filos-marble'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-filos-marble transition"
            >
              <div className="w-7 h-7 rounded-full bg-filos-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-filos-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 hidden sm:block max-w-[140px] truncate">{user?.email}</span>
              <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <Link
                  to="/packages"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-filos-marble hover:text-filos-primary transition"
                >
                  Packages
                </Link>
                <Link
                  to={`/tutors/${id}/preferences`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-filos-marble hover:text-filos-primary transition"
                >
                  Preferences
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-filos-marble hover:text-filos-primary transition"
                  >
                    Admin
                  </Link>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); signOut() }}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-filos-marble hover:text-filos-primary transition"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-400 py-6 px-6 space-y-1">
        <p>Filos &middot; Your {targetLanguage} companion &middot; Powered by kaloma.ai</p>
        <p className="text-gray-300 max-w-2xl mx-auto">
          This is a pet project by Kerem Erdem, maintained on a best-effort basis. It has not undergone a security audit,
          does not guarantee GDPR compliance, and is provided as-is. Use at your own risk.
          For feedback and feature requests, contact{' '}
          <a href="mailto:languagetutor@kaloma.ai" className="hover:text-gray-400 transition underline">languagetutor@kaloma.ai</a>.
        </p>
      </footer>
    </div>
  )
}
