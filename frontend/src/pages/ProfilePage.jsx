import { useState } from "react";
import {
  Activity,
  LogOut,
  Save,
  Trophy,
  MapPin,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { ActionButton } from "../components/ActionButton";
import { availabilityApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

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
      name: form.get("name"),
      age: Number(form.get("age")),
      city: form.get("city"),
      preferredPosition: form.get("preferredPosition"),
      skillLevel: Number(form.get("skillLevel")),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  async function toggleAvailability() {
    const next = !available;
    setAvailable(next);
    await availabilityApi.set(next);
  }

  const overallRating = profile?.skillLevel ? profile.skillLevel * 18 : 84;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="font-display text-3xl font-black tracking-tight">
          Player Card
        </h1>
        <button
          onClick={logout}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all hover:border-red-400/30"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Ultimate Team Style Player Card */}
      <motion.section
        whileHover={{ scale: 1.02, rotateY: 5, rotateX: 2 }}
        className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden glass-panel border border-white/10 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-500"
        style={{ perspective: 1000 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-[#0f1a14] to-[#042614] z-0" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald/20 blur-[80px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan/20 blur-[80px] rounded-full pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0 mix-blend-overlay" />

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex flex-col items-center">
            <span className="font-display text-5xl font-black text-emerald leading-none drop-shadow-md">
              {overallRating}
            </span>
            <span className="text-sm font-black uppercase tracking-widest text-white/70 mt-1">
              {profile?.preferredPosition || "FLEX"}
            </span>
            <div className="mt-4 w-8 h-8 rounded-full bg-surface border-2 border-emerald/50 flex items-center justify-center shadow-glow">
              <span className="text-[10px] font-black">MA</span>
            </div>
          </div>

          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-surface shadow-2xl overflow-hidden bg-obsidian group-hover:border-emerald transition-colors duration-500">
              <img
                src={`https://ui-avatars.com/api/?name=${profile?.name || "HKick"}&background=121212&color=00F260&size=200`}
                alt="avatar"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {available && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-1 right-1 bg-surface rounded-full p-1"
              >
                <div className="w-5 h-5 rounded-full bg-emerald shadow-[0_0_15px_rgba(0,242,96,1)] animate-pulse" />
              </motion.div>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-4 text-center">
          <h2 className="font-display text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white">
            {profile?.name?.split(" ")[0] || "Player"}
          </h2>
          <p className="flex items-center justify-center gap-2 mt-1.5 text-sm text-cyan font-bold uppercase tracking-wide">
            <MapPin size={14} /> {profile?.city || "Casablanca"}
          </p>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 bg-surface/30 backdrop-blur-md rounded-2xl p-2">
          <div className="text-center">
            <p className="font-display text-xl font-black text-white">
              {(profile?.skillLevel || 3) * 16 + 10}
            </p>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              PAC
            </p>
          </div>
          <div className="text-center border-l border-r border-white/10">
            <p className="font-display text-xl font-black text-white">
              {(profile?.skillLevel || 3) * 18 + 5}
            </p>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              SHO
            </p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-black text-white">
              {(profile?.skillLevel || 3) * 17 + 8}
            </p>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              PAS
            </p>
          </div>
        </div>
      </motion.section>

      {/* Progression Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-3xl p-6 border border-white/5 hover:border-emerald/30 transition-colors"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-black flex items-center gap-2">
            <div className="p-2 bg-emerald/10 rounded-xl text-emerald">
              <Trophy size={20} />
            </div>
            Season Progress
          </h3>
          <span className="text-xs font-black bg-surfaceLight border border-white/10 px-3 py-1.5 rounded-xl text-white shadow-inner">
            Level {profile?.skillLevel || 3}
          </span>
        </div>

        <div className="mb-3 flex justify-between text-xs font-bold text-white/60">
          <span className="text-emerald">1,840 XP</span>
          <span>160 XP to next level</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface shadow-inner border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "82%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald via-cyan to-emerald shadow-glow relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-surface/50 rounded-2xl p-4 border border-white/5 hover:bg-surface transition-colors group">
            <UserCheck
              size={20}
              className="text-cyan mb-2 group-hover:scale-110 transition-transform"
            />
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Matches Played
            </p>
            <p className="font-display text-2xl font-black mt-1 text-white group-hover:text-cyan transition-colors">
              12
            </p>
          </div>
          <div className="bg-surface/50 rounded-2xl p-4 border border-white/5 hover:bg-surface transition-colors group">
            <ShieldCheck
              size={20}
              className="text-emerald mb-2 group-hover:scale-110 transition-transform"
            />
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Reliability Score
            </p>
            <p className="font-display text-2xl font-black mt-1 text-white group-hover:text-emerald transition-colors">
              100%
            </p>
          </div>
        </div>
      </motion.section>

      {/* Settings Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-3xl p-6 border border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-black flex items-center gap-2">
            <div className="p-2 bg-cyan/10 rounded-xl text-cyan">
              <Save size={20} />
            </div>
            Edit Profile
          </h3>
          {saved && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs font-black text-obsidian bg-emerald px-3 py-1.5 rounded-xl shadow-glow"
            >
              Saved!
            </motion.span>
          )}
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">
                Name
              </label>
              <input
                className="field bg-surface/50 shadow-inner"
                name="name"
                defaultValue={profile?.name || ""}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">
                Age
              </label>
              <input
                className="field bg-surface/50 shadow-inner"
                name="age"
                type="number"
                defaultValue={profile?.age || 21}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">
                City
              </label>
              <input
                className="field bg-surface/50 shadow-inner"
                name="city"
                defaultValue={profile?.city || "Casablanca"}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">
                Position
              </label>
              <select
                className="field bg-surface/50 shadow-inner"
                name="preferredPosition"
                defaultValue={profile?.preferredPosition || "FLEX"}
              >
                <option value="GK">Goalkeeper (GK)</option>
                <option value="DEF">Defender (DEF)</option>
                <option value="MID">Midfielder (MID)</option>
                <option value="FWD">Forward (FWD)</option>
                <option value="FLEX">Flexible (FLEX)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">
                Skill Level
              </label>
              <select
                className="field bg-surface/50 shadow-inner"
                name="skillLevel"
                defaultValue={profile?.skillLevel || 3}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>
                    Lvl {level} / 5
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/5">
            <button
              type="button"
              onClick={toggleAvailability}
              className={`py-3.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                available
                  ? "border-emerald/50 bg-emerald/10 text-emerald shadow-[0_0_15px_rgba(0,242,96,0.1)]"
                  : "border-white/10 bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              <Activity
                size={18}
                className={available ? "animate-pulse" : ""}
              />
              {available ? "Available" : "Go Available"}
            </button>
            <ActionButton className="w-full py-3.5 text-base tracking-wide">
              Save Details
            </ActionButton>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}
