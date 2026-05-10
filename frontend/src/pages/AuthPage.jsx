import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
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
    <main className="grid min-h-screen bg-obsidian text-white lg:grid-cols-2">
      <section className="relative flex min-h-[40vh] items-end overflow-hidden p-6 sm:p-10">
        <img
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1600&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-emerald px-3 py-2 text-sm font-black text-obsidian">
            <Zap size={17} fill="currentColor" /> HKick
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-6xl text-white">Join the Pitch.</h1>
          <p className="mt-3 text-base font-medium text-white/70">
            The social network for local football players. Connect, book, and play.
          </p>
        </motion.div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={submit} className="w-full max-w-md glass-panel rounded-2xl p-6 md:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#1E1E1E] p-1 border border-[#333333]">
            {['login', 'register'].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition-colors ${mode === item ? 'bg-emerald text-obsidian shadow-glow' : 'text-white/50 hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <input className="field bg-[#121212]" name="email" type="email" placeholder="Email" required defaultValue="captain@hkick.test" />
            <input className="field bg-[#121212]" name="password" type="password" placeholder="Password" required defaultValue="password123" />
            
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                <input className="field bg-[#121212]" name="name" placeholder="Player name" required />
                <div className="grid grid-cols-2 gap-3">
                  <input className="field bg-[#121212]" name="age" type="number" placeholder="Age" min="13" />
                  <select className="field bg-[#121212]" name="preferredPosition">
                    <option value="FLEX">Flex Position</option>
                    <option value="GK">Goalkeeper (GK)</option>
                    <option value="DEF">Defender (DEF)</option>
                    <option value="MID">Midfielder (MID)</option>
                    <option value="FWD">Forward (FWD)</option>
                  </select>
                </div>
                <input className="field bg-[#121212]" name="city" placeholder="City" defaultValue="Casablanca" required />
                <select className="field bg-[#121212]" name="skillLevel" defaultValue="3">
                  {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>Skill level {level}</option>)}
                </select>
              </motion.div>
            )}
          </div>

          {error && <p className="mt-4 text-sm font-bold text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
          
          <ActionButton className="mt-8 w-full py-4 text-base">
            {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
          </ActionButton>
        </form>
      </section>
    </main>
  );
}
