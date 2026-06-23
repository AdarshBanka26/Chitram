import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../api/endpoints.js';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/discover';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.identifier, form.password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to curate, collect and create."
      footer={
        <span>
          New here?{' '}
          <Link to="/register" className="font-semibold text-magenta hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="label">Email or username</label>
          <input
            className="input mt-2"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input mt-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="btn-dark mt-2 w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  );
}
