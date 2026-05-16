import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Mail,
  Lock,
  User,
  Calendar,
  MapPin,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "../components/ActionButton";
import { useAuthStore } from "../store/authStore";

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);

  if (token) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.age = Number(payload.age || 21);
    payload.skillLevel = Number(payload.skillLevel || 3);

    try {
      await (mode === "login" ? login(payload) : register(payload));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen bg-obsidian text-white lg:grid-cols-2 overflow-hidden">
      <section className="relative flex min-h-[40vh] flex-col justify-end overflow-hidden p-8 sm:p-12 lg:p-20">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1600&q=85"
          alt="Football Pitch"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent lg:bg-gradient-to-r lg:from-obsidian/20 lg:via-obsidian/80 lg:to-obsidian" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-sm font-bold text-white shadow-glass">
            <Zap size={18} className="text-emerald" fill="currentColor" />
            <span className="tracking-wider uppercase text-xs">
              HKick Experience
            </span>
          </div>
          <h1 className="font-display text-5xl font-black leading-tight sm:text-7xl text-white mb-4">
            Own the <span className="text-gradient">Pitch.</span>
          </h1>
          <p className="text-lg font-medium text-white/60 max-w-md leading-relaxed">
            The premium network for local footballers. Connect with players,
            book top-tier pitches, and elevate your game.
          </p>
        </motion.div>
      </section>

      <section className="relative flex items-center justify-center p-6 lg:p-12 z-20">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-emerald/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-cyan/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <form
            onSubmit={submit}
            className="glass-panel rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden"
          >
            {/* Subtle inner highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="mb-8 flex rounded-xl bg-white/5 p-1 border border-white/10 backdrop-blur-sm">
              {["login", "register"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setMode(item)}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold capitalize transition-all duration-300 ${
                    mode === item
                      ? "bg-emerald text-obsidian shadow-glow"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
                  size={18}
                />
                <input
                  className="field pl-11"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  required
                  defaultValue="captain@hkick.test"
                />
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
                  size={18}
                />
                <input
                  className="field pl-11"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  defaultValue="password123"
                />
              </div>

              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 pt-2 origin-top"
                  >
                    <div className="relative group">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
                        size={18}
                      />
                      <input
                        className="field pl-11"
                        name="name"
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative group">
                        <Calendar
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
                          size={18}
                        />
                        <input
                          className="field pl-11"
                          name="age"
                          type="number"
                          placeholder="Age"
                          min="13"
                        />
                      </div>
                      <select
                        className="field appearance-none"
                        name="preferredPosition"
                      >
                        <option value="FLEX">Flex Position</option>
                        <option value="GK">Goalkeeper (GK)</option>
                        <option value="DEF">Defender (DEF)</option>
                        <option value="MID">Midfielder (MID)</option>
                        <option value="FWD">Forward (FWD)</option>
                      </select>
                    </div>

                    <div className="relative group">
                      <MapPin
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
                        size={18}
                      />
                      <input
                        className="field pl-11"
                        name="city"
                        placeholder="City"
                        defaultValue="Casablanca"
                        required
                      />
                    </div>

                    <div className="relative group">
                      <Target
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
                        size={18}
                      />
                      <select
                        className="field pl-11 appearance-none"
                        name="skillLevel"
                        defaultValue="3"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>
                            Skill Level {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 text-sm font-semibold text-red-400 bg-red-400/10 p-3.5 rounded-xl border border-red-400/20 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <ActionButton
              className="mt-8 w-full py-4 text-base tracking-wide"
              type="submit"
            >
              {mode === "login" ? "Enter the Pitch" : "Create Player Profile"}{" "}
              <ArrowRight size={18} />
            </ActionButton>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
