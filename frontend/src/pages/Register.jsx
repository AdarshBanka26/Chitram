import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { CATEGORIES } from '../components/CategoryFilter.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../api/endpoints.js';

const PREF_OPTIONS = CATEGORIES.filter((c) => c !== 'all');

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [prefs, setPrefs] = useState([]);
  const [busy, setBusy] = useState(false);

  const togglePref = (c) =>
    setPrefs((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ ...form, preferences: prefs });
      toast.success('Account created');
      navigate('/discover', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Join Chitram"
      subtitle="Become part of the Grand Gallery of Wonders."
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-magenta hover:underline">
            Log in
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Name</label>
            <input className="input mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Username</label>
            <input
              className="input mt-2"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input mt-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input mt-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="label">Interests (for recommendations)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PREF_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => togglePref(c)}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                  prefs.includes(c) ? 'border-magenta bg-magenta text-white' : 'border-ink/15 text-ink/60'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-dark mt-2 w-full" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
