import { Link } from 'react-router-dom';

// The Chitram wordmark — rounded heavy display type.
export default function Logo({ className = '', to = '/' }) {
  return (
    <Link to={to} className={`font-brand text-2xl font-extrabold tracking-tight text-ink ${className}`}>
      Chitram
    </Link>
  );
}