import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-brand text-7xl font-extrabold text-magenta">404</p>
      <h1 className="mt-4 font-display text-3xl font-black text-ink">This wonder has vanished</h1>
      <p className="mt-2 text-ink/60">The page you're looking for has faded into memory.</p>
      <Link to="/" className="btn-dark mt-6">Back to gallery</Link>
    </div>
  );
}
