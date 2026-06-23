import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, FolderHeart, Users, FileUp, ArrowRight } from 'lucide-react';
import { heroStrip } from '../data/galleryImages.js';

// Image that gracefully degrades to a soft gradient if the URL fails.
function ArtImage({ src, tint, className }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <div className={`bg-gradient-to-br ${tint} ${className}`} />;
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

// Lotus-inspired decorative SVG used as a section divider.
function LotusAccent() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 160 32" fill="none" className="w-36" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 26 C65 14 35 10 0 16" stroke="#C9A84C" strokeWidth="1.2" fill="none" />
        <path d="M80 26 C95 14 125 10 160 16" stroke="#C9A84C" strokeWidth="1.2" fill="none" />
        <path d="M80 26 C72 16 60 10 46 12" stroke="#C9A84C" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M80 26 C88 16 100 10 114 12" stroke="#C9A84C" strokeWidth="0.8" fill="none" opacity="0.6" />
        <circle cx="80" cy="12" r="5" fill="#C9A84C" opacity="0.7" />
        <circle cx="80" cy="12" r="2.5" fill="#FF9933" />
        <circle cx="58" cy="18" r="3" fill="#C9A84C" opacity="0.4" />
        <circle cx="102" cy="18" r="3" fill="#C9A84C" opacity="0.4" />
        <circle cx="38" cy="20" r="2" fill="#C9A84C" opacity="0.25" />
        <circle cx="122" cy="20" r="2" fill="#C9A84C" opacity="0.25" />
      </svg>
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold/70">
        रंग · रस · सृष्टि
      </p>
      <p className="font-mono text-[9px] tracking-[0.2em] text-ink/35">
        Colour · Emotion · Creation
      </p>
    </div>
  );
}

const features = [
  {
    n: '01',
    color: 'bg-royal',
    icon: Compass,
    title: 'Discover Art',
    body: 'Discover, create, and share amazing artwork with a global community of artists and art lovers.',
  },
  {
    n: '02',
    color: 'bg-magenta',
    icon: FolderHeart,
    title: 'Create Collections',
    body: 'Organize your inspirations into thematic galleries and share your refined taste with the community.',
  },
  {
    n: '03',
    color: 'bg-olive',
    icon: Users,
    title: 'Connect with Artists',
    body: 'Build meaningful relationships with creators through direct engagement and collaborative opportunities.',
  },
  {
    n: '04',
    color: 'bg-crimson',
    icon: FileUp,
    title: 'Share Your Work',
    body: 'Present your creations in a professional, distraction-free environment designed for visual excellence.',
  },
];

export default function Landing() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="container-x pt-14 md:pt-20">
        {/* Saffron top accent */}
        <div className="mb-6 h-[2px] w-16 bg-gradient-to-r from-saffron to-gold" />
        <p className="label">Premium Indian Artistry</p>
        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h1 className="font-display text-[15vw] font-black leading-[0.88] tracking-tight text-ink sm:text-7xl lg:text-8xl xl:text-9xl">
            Welcome <br className="hidden sm:block" /> to <br />
            <span className="font-brand text-magenta">Chitram</span>
            <span className="ml-3 font-brand text-[0.5em] text-saffron/70 align-middle">चित्रम्</span>
          </h1>
          <div className="lg:pb-6 lg:text-right">
            <p className="ml-auto max-w-sm text-base leading-relaxed text-ink/70">
              A high-fashion digital space where heritage meets contemporary curation. Discover the soul of Indian
              aesthetic excellence — from Madhubani to Mughal, Tanjore to the contemporary.
            </p>
            <Link to="/discover" className="btn-primary mt-6">
              Explore Works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- IMAGE STRIP (5 heritage images) ---------- */}
      <section className="container-x mt-12 border-y border-saffron/15 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {heroStrip.map((img, i) => (
            <Link
              to="/discover"
              key={i}
              className="group relative aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-ink/5"
            >
              <ArtImage
                src={img.src}
                tint={img.tint}
                className="h-full w-full transition duration-500 group-hover:scale-105"
              />
              {/* Saffron shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-saffron/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- HERITAGE ACCENT ---------- */}
      <section className="container-x mt-16 flex flex-col items-center gap-2">
        <LotusAccent />
        <p className="mt-3 max-w-lg text-center text-sm leading-relaxed text-ink/50">
          Celebrating 5,000 years of Indian aesthetic tradition — where every stroke carries the memory of the earth
          and the spirit of the sky.
        </p>
      </section>

      {/* ---------- WHY CHOOSE ---------- */}
      <section className="container-x mt-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-4xl font-black leading-[0.95] text-ink sm:text-5xl">
              Why Choose <br /> Chitram?
            </h2>
            <p className="mt-5 max-w-md text-ink/60">
              The definitive destination for artists, collectors, and seekers of exceptional Indian aesthetic heritage.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/40">
            <span className="h-px w-12 bg-ink/20" />
            Established 2024
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ n, color, icon: Icon, title, body }) => (
            <article
              key={n}
              className={`flex min-h-[340px] flex-col justify-between rounded-card p-7 text-white ${color}`}
            >
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-white/50">{n}</span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-x mt-20 mb-4">
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-card bg-gradient-to-br from-[#3a0a08] via-crimson to-ink px-8 py-16 text-center text-white">
          {/* Gold border frame inside card */}
          <div className="pointer-events-none absolute inset-[6px] rounded-[1.25rem] border border-gold/20" />
          {/* Saffron top accent */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-saffron to-transparent" />

          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-saffron/70">
            The Grand Gallery of Wonders
          </p>
          <p className="font-brand text-3xl font-bold text-gold/80">चित्रम् · Gallery of Wonders</p>
          <h2 className="max-w-2xl font-display text-3xl font-black leading-tight sm:text-4xl">
            Capture every fleeting act. Celebrate every legendary work.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="btn bg-saffron px-7 py-3 text-white hover:bg-gold"
            >
              Start Creating
            </Link>
            <Link
              to="/discover"
              className="btn-outline border-white/30 text-white hover:bg-white hover:text-ink"
            >
              Browse the Gallery
            </Link>
          </div>

          {/* Bottom Sanskrit triad */}
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.35em] text-gold/50">
            रंग · रस · सृष्टि
          </p>
        </div>
      </section>
    </div>
  );
}
