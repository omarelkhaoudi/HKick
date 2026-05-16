import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  MessageSquare,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Clock,
  Trophy,
  MoreHorizontal,
  Sparkles,
  Zap,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { availabilityApi, matchApi } from "../services/api";
import { useLiveHkick } from "../hooks/useLiveHkick";
import { useAuthStore } from "../store/authStore";
import { CreateMatchModal } from "../components/CreateMatchModal";

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [creating, setCreating] = useState(false);
  const [instantState, setInstantState] = useState("");
  const city = user?.profile?.city || "Casablanca";

  const mergeMatch = useCallback((match) => {
    setMatches((current) =>
      [match, ...current.filter((item) => item.id !== match.id)].sort(
        (a, b) => new Date(a.startsAt) - new Date(b.startsAt),
      ),
    );
  }, []);

  useLiveHkick({
    onMatch: mergeMatch,
    onAvailability: (profile) =>
      setPlayers((current) =>
        [profile, ...current.filter((item) => item.id !== profile.id)].filter(
          (item) => item.isAvailable,
        ),
      ),
  });

  useEffect(() => {
    matchApi
      .list()
      .then((data) =>
        setMatches(data.matches.length ? data.matches : demoMatches(city)),
      )
      .catch(() => setMatches(demoMatches(city)));
    availabilityApi
      .nearby()
      .then((data) =>
        setPlayers(data.players.length ? data.players : demoPlayers),
      )
      .catch(() => setPlayers(demoPlayers));
    matchApi
      .matchmaking()
      .then((data) =>
        setRecommendations(
          data.recommendations?.length
            ? data.recommendations
            : demoRecommendations(city),
        ),
      )
      .catch(() => setRecommendations(demoRecommendations(city)));
  }, [city]);

  async function join(id) {
    if (id.startsWith("demo-")) {
      navigate(`/matches/${id}`);
      return;
    }
    try {
      const data = await matchApi.join(id);
      mergeMatch(data.match);
      navigate(`/matches/${data.match.id}`);
    } catch (error) {
      console.error(error);
    }
  }

  async function instantMatch() {
    setInstantState("Finding your perfect match...");
    try {
      const data = await matchApi.instant();
      mergeMatch(data.match);
      navigate(`/matches/${data.match.id}`);
    } catch (error) {
      setTimeout(
        () =>
          setInstantState(
            error.message || "No instant fit right now. Try creating one.",
          ),
        800,
      );
    }
  }

  function onMatchCreated(match) {
    mergeMatch(match);
    navigate(`/matches/${match.id}`);
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto pb-10">
      {/* Header Greeting */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Ready to Play,{" "}
            <span className="text-gradient">
              {user?.profile?.name?.split(" ")[0] || "Captain"}
            </span>
            ?
          </h1>
          <p className="text-sm text-white/50 mt-1 font-medium">
            {city} • {matches.length} matches happening today
          </p>
        </div>
      </header>

      {/* Online Players Stories / Bubbles */}
      <div className="relative">
        <div className="absolute -left-4 -right-4 top-1/2 -translate-y-1/2 h-16 bg-gradient-to-r from-emerald/5 via-cyan/5 to-transparent blur-xl pointer-events-none" />
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x px-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-1.5 min-w-[64px] snap-start cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full border-2 border-emerald/50 p-0.5 relative group transition-all">
              <div className="w-full h-full rounded-full bg-surfaceLight flex items-center justify-center group-hover:bg-emerald/20 transition-colors">
                <Plus size={24} className="text-emerald drop-shadow-md" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald">Be Ready</span>
          </motion.div>
          {players.map((player, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={player.id}
              className="flex flex-col items-center gap-1.5 min-w-[64px] snap-start cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full border-2 border-emerald p-0.5 relative shadow-[0_0_15px_rgba(0,242,96,0.15)] group-hover:shadow-glow transition-shadow">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-xl overflow-hidden">
                  <img
                    src={`https://ui-avatars.com/api/?name=${player.name}&background=121212&color=fff&size=128`}
                    alt={player.name}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-obsidian bg-emerald shadow-[0_0_8px_rgba(0,242,96,0.8)]" />
              </div>
              <span className="text-[10px] font-bold text-white/80 group-hover:text-white transition-colors">
                {player.name.split(" ")[0]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Post Action */}
      <motion.div
        whileHover={{ y: -2 }}
        className="glass-panel rounded-2xl p-2.5 flex items-center gap-3 border border-white/10 hover:border-emerald/30 transition-colors shadow-lg cursor-text"
        onClick={() => setCreating(true)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald to-[#00A643] flex items-center justify-center text-obsidian font-black text-lg shadow-inner">
          {user?.profile?.name?.charAt(0) || "C"}
        </div>
        <div className="flex-1 text-sm font-medium text-white/40 pl-2">
          Organize a match, or share an update...
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-emerald hover:text-obsidian hover:border-emerald transition-all shadow-inner">
          <Plus size={20} />
        </div>
      </motion.div>

      {/* Smart Matchmaking */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="relative p-[1px] rounded-3xl overflow-hidden group"
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald via-cyan to-emerald opacity-30 group-hover:opacity-50 blur-sm transition-opacity duration-500" />

            <div className="relative glass-panel rounded-3xl p-5 border border-white/10 h-full bg-surface/80 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald">
                    <Sparkles size={14} className="animate-pulse" /> Smart
                    Matchmaking
                  </p>
                  <h2 className="mt-1 font-display text-xl font-black">
                    Best fit for tonight
                  </h2>
                </div>
                <button
                  onClick={instantMatch}
                  className="flex items-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-xs font-black text-obsidian hover:shadow-glow hover:scale-105 transition-all"
                >
                  <Zap size={14} /> Instant
                </button>
              </div>

              <div className="space-y-3">
                {recommendations.slice(0, 2).map((item, i) => (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    key={item.match.id}
                    onClick={() => join(item.match.id)}
                    className="w-full rounded-2xl bg-white/5 border border-white/5 p-3.5 text-left transition-all hover:bg-white/10 hover:border-white/20 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald/0 via-emerald/5 to-emerald/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <div className="flex items-center justify-between gap-3 relative z-10">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[15px] drop-shadow-md text-white">
                          {item.match.title}
                        </p>
                        <p className="mt-1.5 flex items-center gap-2 text-[11px] font-bold text-white/50 uppercase tracking-wide">
                          <Flame size={12} className="text-orange-400" />
                          {item.reasons.slice(0, 2).join(" • ")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="rounded-xl bg-cyan/10 border border-cyan/20 px-2.5 py-1 text-sm font-black text-cyan shadow-[0_0_10px_rgba(5,213,255,0.1)]">
                          {item.score}%
                        </span>
                        <span className="text-[9px] font-bold text-white/40 mt-1 uppercase">
                          Match
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {instantState && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-xs font-bold text-emerald text-center"
                  >
                    {instantState}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="space-y-6">
        <h3 className="font-display text-lg font-black tracking-wide text-white/80">
          Happening Soon
        </h3>
        {matches.map((match, index) => (
          <FeedCard key={match.id} match={match} onJoin={join} index={index} />
        ))}
      </div>

      <CreateMatchModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={onMatchCreated}
        user={user}
      />
    </div>
  );
}

function FeedCard({ match, onJoin, index }) {
  const spotsLeft = match.maxPlayers - match.playersCount;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 hover:border-emerald/30 transition-all duration-500 group"
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/5 bg-surface/30">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${match.title}&background=171717&color=fff&size=48`}
              alt="avatar"
              className="w-12 h-12 rounded-xl object-cover opacity-90"
            />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
          </div>
          <div>
            <p className="font-display text-base font-black text-white drop-shadow-md group-hover:text-emerald transition-colors">
              {match.title}
            </p>
            <p className="text-xs font-medium text-white/50 mt-0.5">
              {match.city} • 2h ago
            </p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Match Details */}
      <div className="p-5">
        <div className="bg-surfaceLight/50 rounded-2xl p-4 border border-white/5 shadow-inner">
          <div className="flex items-center justify-between mb-5">
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${spotsLeft > 0 ? "bg-emerald/10 text-emerald border border-emerald/20 shadow-[0_0_10px_rgba(0,242,96,0.1)]" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}
            >
              {match.status}
            </span>
            <span className="text-emerald text-xs font-black uppercase tracking-wide bg-emerald/5 px-2 py-1 rounded-md">
              {spotsLeft} spots left
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-white/80 font-medium">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan">
                <Calendar size={14} />
              </div>
              <span className="text-xs">
                {new Date(match.startsAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan">
                <Clock size={14} />
              </div>
              <span className="text-xs">
                {new Date(match.startsAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan">
                <MapPin size={14} />
              </div>
              <span className="text-xs truncate">
                {match.terrain?.name || match.city}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center text-cyan">
                <Trophy size={14} />
              </div>
              <span className="text-xs">
                Lvl {match.averageSkill || "-"} / 5.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 p-2 -ml-2 rounded-xl transition-all">
            <Heart size={20} />
            <span className="text-xs font-bold">12</span>
          </button>
          <button className="flex items-center gap-1.5 text-white/40 hover:text-cyan hover:bg-cyan/10 p-2 rounded-xl transition-all">
            <MessageSquare size={20} />
            <span className="text-xs font-bold">3</span>
          </button>
          <button className="flex items-center gap-1.5 text-white/40 hover:text-emerald hover:bg-emerald/10 p-2 rounded-xl transition-all">
            <Share2 size={20} />
          </button>
        </div>
        <button
          onClick={() => onJoin(match.id)}
          disabled={spotsLeft === 0}
          className="bg-gradient-to-r from-emerald to-[#00d455] text-obsidian font-black text-sm px-6 py-3 rounded-xl hover:shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald/50"
        >
          Join Match
        </button>
      </div>
    </motion.article>
  );
}

// Demo Data
function demoMatches(city) {
  const now = new Date();
  return [
    {
      id: "demo-1",
      title: "Maarif 5v5 Evening",
      city,
      startsAt: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
      maxPlayers: 10,
      playersCount: 8,
      averageSkill: 3.8,
      status: "OPEN",
      terrain: { name: "Casa Arena" },
    },
    {
      id: "demo-2",
      title: "Anfa Pro Training",
      city,
      startsAt: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      maxPlayers: 14,
      playersCount: 11,
      averageSkill: 4.5,
      status: "OPEN",
      terrain: { name: "Anfa Street Pitch" },
    },
  ];
}

const demoPlayers = [
  {
    id: "p1",
    name: "Amine",
    preferredPosition: "MID",
    skillLevel: 4,
    isAvailable: true,
  },
  {
    id: "p2",
    name: "Omar",
    preferredPosition: "FWD",
    skillLevel: 5,
    isAvailable: true,
  },
  {
    id: "p3",
    name: "Yassine",
    preferredPosition: "DEF",
    skillLevel: 3,
    isAvailable: true,
  },
  {
    id: "p4",
    name: "Hamza",
    preferredPosition: "GK",
    skillLevel: 4,
    isAvailable: true,
  },
  {
    id: "p5",
    name: "Karim",
    preferredPosition: "DEF",
    skillLevel: 2,
    isAvailable: true,
  },
];

function demoRecommendations(city) {
  return demoMatches(city).map((match, index) => ({
    match,
    score: index === 0 ? 92 : 84,
    reasons:
      index === 0
        ? ["starts soon", "fast fill", "strong skill fit"]
        : ["pitch linked", "tonight", "FWD needed"],
  }));
}
