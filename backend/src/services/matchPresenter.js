export function presentMatch(match) {
  return {
    ...match,
    playersCount: match.players?.length ?? 0,
    averageSkill: averageSkill(match.players ?? [])
  };
}

function averageSkill(players) {
  if (!players.length) return 0;
  const total = players.reduce((sum, player) => sum + (player.user.profile?.skillLevel ?? 1), 0);
  return Number((total / players.length).toFixed(1));
}
