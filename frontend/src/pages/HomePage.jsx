import { useCallback, useEffect, useState } from 'react';
import { Plus, MessageSquare, Heart, Share2, MapPin, Calendar, Clock, Trophy, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { availabilityApi, matchApi } from '../services/api';
import { useLiveHkick } from '../hooks/useLiveHkick';
import { useAuthStore } from '../store/authStore';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const city = user?.profile?.city || 'Casablanca';

  const mergeMatch = useCallback((match) => {
    setMatches((current) => [match, ...current.filter((item) => item.id !== match.id)].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)));
  }, []);

  useLiveHkick({
    onMatch: mergeMatch,
    onAvailability: (profile) => setPlayers((current) => [profile, ...current.filter((item) => item.id !== profile.id)].filter((item) => item.isAvailable))
  });

  useEffect(() => {
    matchApi.list().then((data) => setMatches(data.matches.length ? data.matches : demoMatches(city))).catch(() => setMatches(demoMatches(city)));
    availabilityApi.nearby().then((data) => setPlayers(data.players.length ? data.players : demoPlayers)).catch(() => setPlayers(demoPlayers));
  }, [city]);

  async function join(id) {
    if (id.startsWith('demo-')) {
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

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Create Post Action */}
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald flex items-center justify-center text-obsidian font-bold text-lg">
          {user?.profile?.name?.charAt(0) || 'O'}
        </div>
        <div className="flex-1 bg-[#1E1E1E] rounded-full px-4 py-2.5 text-sm text-white/50 border border-[#333333] cursor-text">
          Organize a match, or share an update...
        </div>
        <button className="icon-button shrink-0">
          <Plus size={20} />
        </button>
      </div>

      {/* Online Players Stories / Bubbles */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex flex-col items-center gap-1 min-w-[64px]">
          <div className="w-16 h-16 rounded-full border-2 border-emerald p-0.5 relative">
            <div className="w-full h-full rounded-full bg-[#1E1E1E] flex items-center justify-center">
               <Plus size={24} className="text-emerald" />
            </div>
          </div>
          <span className="text-[10px] font-medium">Be Ready</span>
        </div>
        {players.map(player => (
          <div key={player.id} className="flex flex-col items-center gap-1 min-w-[64px]">
            <div className="w-16 h-16 rounded-full border-2 border-emerald p-0.5 relative">
              <div className="w-full h-full rounded-full bg-[#333333] flex items-center justify-center font-bold text-xl overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${player.name}&background=121212&color=00F260&size=128`} alt={player.name} />
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-obsidian bg-emerald shadow-[0_0_8px_rgba(0,242,96,0.8)]" />
            </div>
            <span className="text-[10px] font-medium">{player.name}</span>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {matches.map((match) => (
          <FeedCard key={match.id} match={match} onJoin={join} />
        ))}
      </div>
    </div>
  );
}

function FeedCard({ match, onJoin }) {
  const spotsLeft = match.maxPlayers - match.playersCount;
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={`https://ui-avatars.com/api/?name=${match.title}&background=1E1E1E&color=fff&size=40`} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm font-bold">{match.title}</p>
            <p className="text-xs text-white/50">{match.city} • 2h ago</p>
          </div>
        </div>
        <button className="text-white/50 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Match Details */}
      <div className="px-4 pb-3">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#333333]/50">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-emerald/10 text-emerald text-xs font-bold px-2 py-1 rounded-md uppercase">
              {match.status}
            </span>
            <span className="text-emerald text-sm font-bold">{spotsLeft} spots left</span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-cyan" />
              <span>{new Date(match.startsAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-cyan" />
              <span>{new Date(match.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-cyan" />
              <span>{match.terrain?.name || match.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-cyan" />
              <span>Lvl {match.averageSkill || '-'} / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-white/50 hover:text-emerald transition">
            <Heart size={20} />
            <span className="text-xs font-medium">12</span>
          </button>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-cyan transition">
            <MessageSquare size={20} />
            <span className="text-xs font-medium">3</span>
          </button>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition">
            <Share2 size={20} />
          </button>
        </div>
        <button 
          onClick={() => onJoin(match.id)}
          className="bg-emerald text-obsidian font-bold text-sm px-6 py-2 rounded-full hover:shadow-glow transition-shadow"
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
      id: 'demo-1',
      title: 'Maarif 5v5 Evening',
      city,
      startsAt: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
      maxPlayers: 10,
      playersCount: 8,
      averageSkill: 3.8,
      status: 'OPEN',
      terrain: { name: 'Casa Arena' }
    },
    {
      id: 'demo-2',
      title: 'Anfa Pro Training',
      city,
      startsAt: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      maxPlayers: 14,
      playersCount: 11,
      averageSkill: 4.5,
      status: 'OPEN',
      terrain: { name: 'Anfa Street Pitch' }
    }
  ];
}

const demoPlayers = [
  { id: 'p1', name: 'Amine', preferredPosition: 'MID', skillLevel: 4, isAvailable: true },
  { id: 'p2', name: 'Omar', preferredPosition: 'FWD', skillLevel: 5, isAvailable: true },
  { id: 'p3', name: 'Yassine', preferredPosition: 'DEF', skillLevel: 3, isAvailable: true },
  { id: 'p4', name: 'Hamza', preferredPosition: 'GK', skillLevel: 4, isAvailable: true },
  { id: 'p5', name: 'Karim', preferredPosition: 'DEF', skillLevel: 2, isAvailable: true }
];
