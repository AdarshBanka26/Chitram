import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Upload as UploadIcon, LogOut, LayoutDashboard } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/discover', label: 'Discover' },
  { to: '/collections', label: 'Collections' },
  { to: '/saved', label: 'Saved', auth: true },
  { to: '/dashboard', label: 'Dashboard', auth: true },
];

export default function Navbar() {
  const { user, isAuthed, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `font-mono text-[13px] uppercase tracking-[0.15em] transition-colors ${
      isActive ? 'text-royal' : 'text-ink/70 hover:text-ink'
    }`;

  const visibleLinks = links.filter((l) => !l.auth || isAuthed);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-white/85 backdrop-blur-md">
      {/* Saffron top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-saffron/60 to-transparent" />
      <div className="container-x flex h-14 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {visibleLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthed ? (
            <>
              <Link to="/upload" className="btn-outline">
                <UploadIcon className="h-4 w-4" /> Upload
              </Link>
              <Link
                to={`/u/${user.username}`}
                className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-magenta font-mono text-sm font-bold text-white"
                title={user.username}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  user.name?.[0]?.toUpperCase() || 'U'
                )}
              </Link>
              <button onClick={handleLogout} className="text-ink/50 hover:text-magenta" title="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-mono text-[13px] uppercase tracking-[0.15em] text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link to="/register" className="btn-saffron">
                Join
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ink/10 bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {visibleLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-3 border-t border-ink/10 pt-4">
              {isAuthed ? (
                <>
                  <Link to="/upload" className="btn-outline" onClick={() => setOpen(false)}>
                    <UploadIcon className="h-4 w-4" /> Upload
                  </Link>
                  <Link to="/dashboard" className="btn-outline" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="btn-outline"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className="btn-saffron" onClick={() => setOpen(false)}>
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
