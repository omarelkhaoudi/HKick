import { useState } from 'react';
import { Activity, Gauge, LogOut, Medal, Moon, Save, Star, Sun, Trophy, UserRound } from 'lucide-react';
import { ActionButton } from '../components/ActionButton';
import { availabilityApi } from '../services/api';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const profile = user?.profile;
  const [saved, setSaved] = useState(false);
  const [available, setAvailable] = useState(Boolean(profile?.isAvailable));

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateProfile({
      name: form.get('name'),
      age: Number(form.get('age')),
      city: form.get('city'),
      preferredPosition: form.get('preferredPosition'),
      skillLevel: Number(form.get('skillLevel'))
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  async function toggleAvailability() {
    const next = !available;
    setAvailable(next);
    await availabilityApi.set(next);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative overflow-hidden rounded-lg bg-ink p-6 text-white">
          <img src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/25" />
          <div className="relative">
            <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-limeball text-ink">
              <UserRound size={30} />
            </span>
            <p className="mt-6 text-sm font-black uppercase text-limeball">Player profile</p>
            <h1 className="mt-2 text-4xl font-black">{profile?.name || 'HKick player'}</h1>
            <p className="mt-2 text-white/65">{profile?.city || 'Casablanca'} / {profile?.preferredPosition || 'FLEX'} / Skill level {profile?.skillLevel || 3}</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Stat label="trust" value="94" />
              <Stat label="level" value={profile?.skillLevel || 3} />
              <Stat label="matches" value="12" />
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-turf dark:text-limeball">Player settings</p>
              <h2 className="text-2xl font-black">Tune your match fit</h2>
            </div>
            {saved && <span className="rounded-lg bg-limeball px-3 py-2 text-xs font-black text-ink">Saved</span>}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="field" name="name" defaultValue={profile?.name || ''} placeholder="Name" />
            <input className="field" name="age" type="number" defaultValue={profile?.age || 21} placeholder="Age" />
            <input className="field" name="city" defaultValue={profile?.city || 'Casablanca'} placeholder="City" />
            <select className="field" name="preferredPosition" defaultValue={profile?.preferredPosition || 'FLEX'}>
              <option value="GK">Goalkeeper</option>
              <option value="DEF">Defender</option>
              <option value="MID">Midfielder</option>
              <option value="FWD">Forward</option>
              <option value="FLEX">Flexible</option>
            </select>
            <label className="sm:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-black/55 dark:text-white/55"><Gauge size={16} /> Skill level</span>
              <select className="field" name="skillLevel" defaultValue={profile?.skillLevel || 3}>
                {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>Level {level}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ActionButton><Save size={17} /> Save profile</ActionButton>
            <ActionButton type="button" variant="ghost" onClick={toggleAvailability}>
              <Activity size={17} /> {available ? 'Go offline' : 'Go available'}
            </ActionButton>
            <ActionButton type="button" variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />} {theme === 'dark' ? 'Light' : 'Dark'}
            </ActionButton>
          </div>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Insight title="Reliability" value="On time" text="Use this later for no-show penalties and captain trust." />
        <Insight title="Best fit" value={profile?.preferredPosition || 'FLEX'} text="Used by matchmaking and team balancing." />
        <Insight title="Market" value={profile?.city || 'Casablanca'} text="Controls nearby matches, terrains, and live radar." />
      </section>

      <section className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-turf dark:text-limeball">Level progression</p>
            <h2 className="text-2xl font-black">Your football growth</h2>
          </div>
          <Trophy size={22} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ProgressCard icon={Star} title="XP" value="1,840" text="160 XP until level 5" />
          <ProgressCard icon={Medal} title="Rank" value="#24" text="Casablanca midfielders" />
          <ProgressCard icon={Gauge} title="Form" value="8.6" text="Based on last 5 matches" />
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div className="h-full w-[82%] rounded-full bg-limeball" />
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
        <h2 className="text-xl font-black">Account</h2>
        <div className="mt-4">
          <ActionButton variant="ghost" onClick={logout}><LogOut size={17} /> Logout</ActionButton>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-3">
      <p className="text-2xl font-black text-limeball">{value}</p>
      <p className="text-xs font-black uppercase text-white/55">{label}</p>
    </div>
  );
}

function Insight({ title, value, text }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
      <p className="text-xs font-black uppercase text-turf dark:text-limeball">{title}</p>
      <h3 className="mt-2 text-xl font-black">{value}</h3>
      <p className="mt-1 text-sm font-medium text-black/55 dark:text-white/55">{text}</p>
    </div>
  );
}

function ProgressCard({ icon: Icon, title, value, text }) {
  return (
    <div className="rounded-lg bg-black/[0.04] p-4 dark:bg-white/[0.06]">
      <Icon size={19} className="text-turf dark:text-limeball" />
      <p className="mt-3 text-xs font-black uppercase text-black/45 dark:text-white/45">{title}</p>
      <h3 className="mt-1 text-2xl font-black">{value}</h3>
      <p className="mt-1 text-sm font-medium text-black/55 dark:text-white/55">{text}</p>
    </div>
  );
}
