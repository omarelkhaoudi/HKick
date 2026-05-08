import { Bot, Shield, Shirt, Sparkles } from 'lucide-react';

export function TeamBoard({ players = [] }) {
  const normalized = players.map((player) => ({
    id: player.id,
    team: player.team,
    name: player.user?.profile?.name || player.name || 'Player',
    position: player.user?.profile?.preferredPosition || player.preferredPosition || 'FLEX',
    skillLevel: player.user?.profile?.skillLevel || player.skillLevel || 1
  }));

  const teams = ['Volt', 'Pulse'].map((team) => ({
    name: team,
    players: normalized.filter((player) => player.team === team)
  }));

  const totals = teams.map((team) => team.players.reduce((sum, player) => sum + player.skillLevel, 0));
  const balanceGap = Math.abs((totals[0] || 0) - (totals[1] || 0));

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-limeball/35 bg-limeball/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase text-turf dark:text-limeball"><Bot size={15} /> AI balance engine</p>
            <h2 className="mt-1 text-2xl font-black">Squads stay fair after every join</h2>
          </div>
          <span className="rounded-lg bg-limeball px-3 py-2 text-sm font-black text-ink">
            Gap {balanceGap} power
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {teams.map((team) => (
          <section key={team.name} className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-limeball dark:bg-limeball dark:text-ink">
                  <Shield size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-black">Team {team.name}</h3>
                  <p className="text-xs font-black uppercase text-black/45 dark:text-white/45">{team.players.length} players</p>
                </div>
              </div>
              <span className="text-xs font-black uppercase text-black/45 dark:text-white/45">
                {team.players.reduce((sum, player) => sum + player.skillLevel, 0)} power
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {team.players.map((player) => (
                <div key={player.id} className="flex items-center justify-between rounded-lg bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]">
                  <div className="flex min-w-0 items-center gap-2">
                    <Shirt size={16} className="shrink-0 text-turf dark:text-limeball" />
                    <div className="min-w-0">
                      <p className="truncate font-black">{player.name}</p>
                      <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">{player.position}</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-ink dark:bg-ink dark:text-limeball">L{player.skillLevel}</span>
                </div>
              ))}
              {!team.players.length && (
                <p className="flex items-center gap-2 rounded-lg bg-black/[0.04] px-3 py-3 text-sm font-bold text-black/45 dark:bg-white/[0.06] dark:text-white/45">
                  <Sparkles size={15} /> Waiting for players
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
