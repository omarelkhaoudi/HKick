export function balanceTeams(players) {
  const sorted = [...players].sort((a, b) => {
    const levelA = a.user.profile?.skillLevel ?? 1;
    const levelB = b.user.profile?.skillLevel ?? 1;
    return levelB - levelA;
  });

  const teams = [
    { name: 'Volt', total: 0, players: [] },
    { name: 'Pulse', total: 0, players: [] }
  ];

  for (const player of sorted) {
    const skill = player.user.profile?.skillLevel ?? 1;
    const target = teams[0].total <= teams[1].total ? teams[0] : teams[1];
    target.players.push(player.userId);
    target.total += skill;
  }

  return teams;
}
