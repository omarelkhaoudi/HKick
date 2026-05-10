import { useState } from 'react';
import { Activity, Gauge, LogOut, Medal, Save, Star, Trophy, MapPin, UserCheck, ShieldCheck } from 'lucide-react';
import { ActionButton } from '../components/ActionButton';
import { availabilityApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
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
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
        <h1 className="text-2xl font-bold">Player Card</h1>
        <button onClick={logout} className="text-white/50 hover:text-white transition">
          <LogOut size={20} />
        </button>
      </div>

      {/* Ultimate Team Style Player Card */}
      <section className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-[#333333]/80 p-6 flex flex-col justify-between shadow-2xl shadow-emerald/5 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0C]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald/10 blur-[64px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan/10 blur-[64px] rounded-full" />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-emerald leading-none">{profile?.skillLevel ? profile.skillLevel * 18 : 84}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white/50 mt-1">{profile?.preferredPosition || 'FLEX'}</span>
            <div className="mt-4 w-6 h-6 rounded-full bg-obsidian border border-[#333333] flex items-center justify-center">
              <span className="text-[10px]">MA</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[#333333] overflow-hidden bg-obsidian">
              <img src={`https://ui-avatars.com/api/?name=${profile?.name || 'HKick'}&background=121212&color=00F260&size=200`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            {available && (
              <div className="absolute -bottom-1 -right-1 bg-obsidian rounded-full p-1">
                <div className="w-4 h-4 rounded-full bg-emerald shadow-[0_0_8px_rgba(0,242,96,0.8)]" />
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-6 text-center">
          <h2 className="text-3xl font-black uppercase tracking-wide">{profile?.name || 'Player'}</h2>
          <p className="flex items-center justify-center gap-2 mt-1 text-sm text-white/60 font-medium">
            <MapPin size={14} className="text-cyan" /> {profile?.city || 'Casablanca'}
          </p>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-3 gap-2 border-t border-[#333333]/50 pt-4">
          <div className="text-center">
            <p className="text-lg font-black text-white">94</p>
            <p className="text-[10px] font-bold text-white/40 uppercase">PAC</p>
          </div>
          <div className="text-center border-l border-r border-[#333333]/50">
            <p className="text-lg font-black text-white">88</p>
            <p className="text-[10px] font-bold text-white/40 uppercase">SHO</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white">92</p>
            <p className="text-[10px] font-bold text-white/40 uppercase">PAS</p>
          </div>
        </div>
      </section>

      {/* Progression Section */}
      <section className="glass-panel rounded-2xl p-5 border border-[#333333]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><Trophy size={18} className="text-emerald" /> Season Progress</h3>
          <span className="text-xs font-bold bg-[#1E1E1E] px-2 py-1 rounded text-white/60">Level {profile?.skillLevel || 3}</span>
        </div>
        
        <div className="mb-2 flex justify-between text-xs font-bold text-white/60">
          <span>1,840 XP</span>
          <span>160 XP to next level</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#1E1E1E] shadow-inner">
          <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald to-cyan shadow-[0_0_12px_rgba(0,242,96,0.4)]" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#333333]/50">
            <UserCheck size={16} className="text-cyan mb-2" />
            <p className="text-xs font-bold text-white/40 uppercase">Matches</p>
            <p className="text-xl font-black mt-1">12</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#333333]/50">
            <ShieldCheck size={16} className="text-emerald mb-2" />
            <p className="text-xs font-bold text-white/40 uppercase">Reliability</p>
            <p className="text-xl font-black mt-1">100%</p>
          </div>
        </div>
      </section>

      {/* Settings Form */}
      <section className="glass-panel rounded-2xl p-5 border border-[#333333]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold flex items-center gap-2"><Save size={18} /> Edit Profile</h3>
          {saved && <span className="text-xs font-bold text-obsidian bg-emerald px-2 py-1 rounded">Saved</span>}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-white/50 uppercase mb-1 block">Name</label>
              <input className="field bg-[#1A1A1A]" name="name" defaultValue={profile?.name || ''} />
            </div>
            
            <div>
              <label className="text-xs font-bold text-white/50 uppercase mb-1 block">Age</label>
              <input className="field bg-[#1A1A1A]" name="age" type="number" defaultValue={profile?.age || 21} />
            </div>
            
            <div>
              <label className="text-xs font-bold text-white/50 uppercase mb-1 block">City</label>
              <input className="field bg-[#1A1A1A]" name="city" defaultValue={profile?.city || 'Casablanca'} />
            </div>
            
            <div>
              <label className="text-xs font-bold text-white/50 uppercase mb-1 block">Position</label>
              <select className="field bg-[#1A1A1A]" name="preferredPosition" defaultValue={profile?.preferredPosition || 'FLEX'}>
                <option value="GK">GK</option>
                <option value="DEF">DEF</option>
                <option value="MID">MID</option>
                <option value="FWD">FWD</option>
                <option value="FLEX">FLEX</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-white/50 uppercase mb-1 block">Skill (1-5)</label>
              <select className="field bg-[#1A1A1A]" name="skillLevel" defaultValue={profile?.skillLevel || 3}>
                {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>Lvl {level}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <ActionButton type="button" variant="ghost" onClick={toggleAvailability} className="w-full">
              <Activity size={16} className={available ? 'text-emerald' : 'text-white/50'} /> 
              {available ? 'Go Offline' : 'Go Available'}
            </ActionButton>
            <ActionButton className="w-full">
              Save Changes
            </ActionButton>
          </div>
        </form>
      </section>
    </div>
  );
}
