import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { ActionButton } from '../components/ActionButton';
import { useAuthStore } from '../store/authStore';

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  if (token) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.age = Number(payload.age || 21);
    payload.skillLevel = Number(payload.skillLevel || 3);

    try {
      await (mode === 'login' ? login(payload) : register(payload));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen bg-ink text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex min-h-[42vh] items-end overflow-hidden p-6 sm:p-10">
        <img
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1600&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-limeball px-3 py-2 text-sm font-black text-ink">
            <Trophy size={17} /> HKick
          </div>
          <h1 className="text-5xl font-black leading-none sm:text-7xl">Play tonight. Book now. Balance instantly.</h1>
          <p className="mt-5 max-w-xl text-lg font-medium text-white/75">
            Real-time amateur football matchmaking for players, captains, and terrain owners.
          </p>
        </motion.div>
      </section>

      <section className="flex items-center justify-center px-5 py-8">
        <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.08] p-5 backdrop-blur-xl">
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-white/10 p-1">
            {['login', 'register'].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-lg px-4 py-2 text-sm font-black capitalize ${mode === item ? 'bg-limeball text-ink' : 'text-white/65'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input className="field" name="email" type="email" placeholder="Email" required defaultValue="captain@hkick.test" />
            <input className="field" name="password" type="password" placeholder="Password" required defaultValue="password123" />
            {mode === 'register' && (
              <>
                <input className="field" name="name" placeholder="Player name" required />
                <div className="grid grid-cols-2 gap-3">
                  <input className="field" name="age" type="number" placeholder="Age" min="13" />
                  <select className="field" name="preferredPosition">
                    <option value="FLEX">Flex</option>
                    <option value="GK">GK</option>
                    <option value="DEF">DEF</option>
                    <option value="MID">MID</option>
                    <option value="FWD">FWD</option>
                  </select>
                </div>
                <input className="field" name="city" placeholder="City" defaultValue="Casablanca" required />
                <select className="field" name="skillLevel" defaultValue="3">
                  {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>Skill level {level}</option>)}
                </select>
              </>
            )}
          </div>

          {error && <p className="mt-3 text-sm font-bold text-red-300">{error}</p>}
          <ActionButton className="mt-5 w-full">
            Continue <ArrowRight size={17} />
          </ActionButton>
        </form>
      </section>
    </main>
  );
}
