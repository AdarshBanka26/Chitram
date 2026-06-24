import { Link } from 'react-router-dom';
import { Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-cream">
      <div className="container-x grid grid-cols-1 gap-12 py-16 md:grid-cols-3">
        <div>
          <span className="font-brand text-2xl font-extrabold text-ink">Chitram</span>
          <p className="mt-3 max-w-xs text-sm text-ink/60">
            Elevating Indian digital art to an editorial standard. Defined by excellence.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/60">
              <Globe className="h-4 w-4" />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/60">
              <Share2 className="h-4 w-4" />
            </span>
          </div>

          <p className="label mt-8">Newsletter</p>
          <p className="mt-2 max-w-xs text-sm text-ink/60">Join our curated digest for the latest in Indian artistry.</p>
          <form className="mt-3 flex max-w-xs flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
            <input className="input" placeholder="Email Address" type="email" />
            <button className="btn-dark w-full">Subscribe</button>
          </form>
        </div>

        <div className="md:justify-self-center">
          <p className="label mb-4">Gallery</p>
          <ul className="space-y-3 text-sm text-ink/70">
            <li><Link to="/discover" className="hover:text-magenta">Discover</Link></li>
            <li><Link to="/collections" className="hover:text-magenta">Collections</Link></li>
            <li><Link to="/saved" className="hover:text-magenta">Saved</Link></li>
            <li><Link to="/dashboard" className="hover:text-magenta">Dashboard</Link></li>
          </ul>
        </div>

        <div className="md:justify-self-center">
          <p className="label mb-4">Company</p>
          <ul className="space-y-3 text-sm text-ink/70">
            <li><span className="hover:text-magenta">Careers</span></li>
            <li><span className="hover:text-magenta">About Us</span></li>
            <li><span className="hover:text-magenta">Terms</span></li>
            <li><span className="hover:text-magenta">Privacy</span></li>
          </ul>
        </div>
      </div>
      <div className="container-x flex items-center justify-between border-t border-ink/10 py-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/40">
          © 2024 Chitram Art Gallery. Defined by excellence.
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/40">01 / 04</p>
      </div>
    </footer>
  );
}