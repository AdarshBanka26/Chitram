import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

// Split-screen shell for login / register pages — keeps the brand vibe
// (white form panel + a vibrant art-tinted panel).
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <h1 className="mt-10 font-display text-3xl font-black text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink/60">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-ink/60">{footer}</div>}
          <Link to="/" className="mt-10 inline-block font-mono text-xs uppercase tracking-widest text-ink/40 hover:text-ink">
            ← Back to home
          </Link>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-magenta via-royal to-olive lg:block">
        <div className="absolute inset-0 flex flex-col justify-end p-14 text-white">
          <span className="font-brand text-6xl font-extrabold">Chitram</span>
          <p className="mt-4 max-w-md text-lg text-white/85">
            A timeless stage where every performer's legendary act is captured and celebrated.
          </p>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
            The Grand Gallery of Wonders
          </p>
        </div>
      </div>
    </div>
  );
}