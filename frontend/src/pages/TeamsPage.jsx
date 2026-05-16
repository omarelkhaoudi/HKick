import { useState } from "react";
import {
  Shield,
  Plus,
  Trophy,
  Users,
  Search,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "../components/ActionButton";

export function TeamsPage() {
  const [activeTab, setActiveTab] = useState("discover"); // 'discover' | 'my-team' | 'create'
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8 max-w-xl mx-auto pb-10">
      {/* Header */}
      <header className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Teams & Leagues
            </h1>
            <p className="text-sm text-white/50 mt-1 font-medium">
              Join a squad or build your own dynasty.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 glass-panel rounded-2xl w-full">
          {["discover", "my-team", "create"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl capitalize transition-all duration-300 ${
                activeTab === tab
                  ? "bg-emerald text-obsidian shadow-glow"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "discover" && (
            <DiscoverTeams
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {activeTab === "my-team" && (
            <MyTeam onExplore={() => setActiveTab("discover")} />
          )}
          {activeTab === "create" && <CreateTeam />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DiscoverTeams({ searchQuery, setSearchQuery }) {
  const teams = [
    {
      id: 1,
      name: "Casablanca FC",
      members: 12,
      rating: 4.8,
      league: "Pro League",
      logo: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      name: "Rabat Royals",
      members: 8,
      rating: 4.5,
      league: "Amateur Div 1",
      logo: "https://images.unsplash.com/photo-1518605368461-1ee51a140f09?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 3,
      name: "Marrakech United",
      members: 15,
      rating: 4.9,
      league: "Pro League",
      logo: "https://images.unsplash.com/photo-1508344928928-7137b29de216?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 4,
      name: "Agadir Sharks",
      members: 9,
      rating: 4.2,
      league: "Amateur Div 2",
      logo: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search for a team..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="field pl-11 py-3.5 bg-surface/50 shadow-inner rounded-2xl w-full"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((team, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            key={team.id}
            className="glass-panel p-4 rounded-2xl flex items-center gap-4 cursor-pointer border border-white/5 hover:border-emerald/30 transition-all duration-300"
          >
            <img
              src={team.logo}
              alt={team.name}
              className="w-16 h-16 rounded-xl object-cover opacity-90"
            />
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg text-white drop-shadow-md">
                {team.name}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-white/60 font-medium">
                <span className="flex items-center gap-1">
                  <Users size={14} className="text-cyan" /> {team.members}{" "}
                  Players
                </span>
                <span className="flex items-center gap-1">
                  <Trophy size={14} className="text-yellow-400" /> {team.league}
                </span>
              </div>
            </div>
            <button className="h-10 w-10 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-emerald hover:text-obsidian hover:border-emerald transition-all hover:shadow-glow">
              <Plus size={20} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MyTeam({ onExplore }) {
  return (
    <div className="text-center py-16 glass-panel rounded-3xl border border-white/5 flex flex-col items-center">
      <div className="w-24 h-24 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mb-6 shadow-glow border border-emerald/20">
        <Shield size={40} />
      </div>
      <h2 className="font-display text-2xl font-black mb-3">No Team Yet</h2>
      <p className="text-white/50 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
        You haven't joined a team yet. Discover existing teams or create your
        own to start climbing the leagues!
      </p>
      <ActionButton onClick={onExplore} variant="primary">
        Explore Teams
      </ActionButton>
    </div>
  );
}

function CreateTeam() {
  const [type, setType] = useState("competitive");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-6 sm:p-8 rounded-[2rem] border border-white/10"
    >
      <h2 className="font-display text-2xl font-black mb-6 flex items-center gap-3">
        <div className="p-2 bg-emerald/20 rounded-xl text-emerald">
          <Shield size={24} />
        </div>
        Build Your Squad
      </h2>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
            Team Name
          </label>
          <input
            className="field bg-surface/50"
            placeholder="e.g. Casablanca FC"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
            City / Region
          </label>
          <input
            className="field bg-surface/50"
            placeholder="Where is your team based?"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
            Team Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("competitive")}
              className={`py-3.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                type === "competitive"
                  ? "border-emerald bg-emerald/10 text-emerald shadow-[0_0_15px_rgba(0,242,96,0.15)]"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {type === "competitive" && <CheckCircle2 size={16} />} Competitive
            </button>
            <button
              type="button"
              onClick={() => setType("casual")}
              className={`py-3.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                type === "casual"
                  ? "border-emerald bg-emerald/10 text-emerald shadow-[0_0_15px_rgba(0,242,96,0.15)]"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {type === "casual" && <CheckCircle2 size={16} />} Casual
            </button>
          </div>
        </div>

        <ActionButton className="w-full mt-8 py-4 text-base tracking-wide">
          Launch Team
        </ActionButton>
      </form>
    </motion.div>
  );
}
