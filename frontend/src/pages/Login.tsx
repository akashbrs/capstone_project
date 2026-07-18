import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      const dest = (location.state as any)?.from?.pathname || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 mb-4 overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-xl">
            <img src="/logo.jpg" alt="Comanda Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-3xl tracking-wide text-paper-100">COMANDA</h1>
          <p className="text-ink-500 text-sm mt-1">Restaurant floor &amp; kitchen POS</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-ink-900 border border-ink-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3.5 py-2.5 text-paper-100 focus:border-amber-500 outline-none transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3.5 py-2.5 text-paper-100 focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-rust-400 text-sm bg-rust-500/10 border border-rust-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-ink-950 font-semibold rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-xs text-ink-500 pt-1">
            Demo: admin / admin123 &middot; cashier / cashier123
          </p>
        </form>
      </div>
    </div>
  );
}
