const BASE_POINTS = {1:30,2:25,3:20,4:18,5:16,6:14,7:12,8:10,9:9,10:8};
const stagePoints = place => place <= 10 ? BASE_POINTS[place] : place <= 15 ? 5 : place <= 20 ? 3 : place <= 25 ? 1 : 0;
const byId = id => document.getElementById(id);

async function getData(){
  const res = await fetch('data/tour-data.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('tour-data.json niet gevonden');
  return res.json();
}

function scoreStage(player, stage){
  if(!stage?.results?.length) return 0;
  return stage.results.reduce((sum, rider, index) => {
    if(!player.riders.includes(rider)) return sum;
    const base = stagePoints(index + 1);
    return sum + (rider === player.captain ? base * 2 : base);
  }, 0);
}

function scoreTotal(player, stages){
  return stages.reduce((sum, stage) => sum + scoreStage(player, stage), 0);
}

function renderRanking(players, stages){
  const last = stages.at(-1);
  const ranked = players.map(p => ({...p, total: scoreTotal(p, stages), today: last ? scoreStage(p, last) : 0}))
    .sort((a,b) => b.total - a.total || b.today - a.today || a.name.localeCompare(b.name));

  byId('statPlayers').textContent = players.length;
  byId('statStages').textContent = stages.length;
  byId('leaderName').textContent = ranked[0]?.total > 0 ? ranked[0].name : 'Nog geen punten';
  byId('leaderMeta').textContent = ranked[0]?.total > 0 ? `${ranked[0].total} punten` : 'Startklaar voor rit 1';

  byId('rankingBody').innerHTML = ranked.map((p, i) => `
    <tr>
      <td class="rank">${i + 1}</td>
      <td><strong>${p.name}</strong></td>
      <td class="points">${p.total}</td>
      <td class="today ${p.today ? 'plus' : ''}">${p.today ? '+' + p.today : '-'}</td>
      <td><span class="pill">⭐ ${p.captain}</span></td>
      <td>${3 - (p.transfersUsed || 0)} over</td>
    </tr>`).join('');

  byId('podiumGrid').innerHTML = ranked.slice(0,3).map((p, i) => `
    <article class="panel podium-card">
      <div class="medal">${['🥇','🥈','🥉'][i] || '🏅'}</div>
      <h3>${p.name}</h3>
      <p>${p.total} punten · kopman ${p.captain}</p>
    </article>`).join('') || `<article class="panel podium-card"><div class="medal">🏁</div><h3>Nog geen stand</h3><p>Na rit 1 verschijnt hier het podium.</p></article>`;

  return ranked;
}

function renderLatest(players, stages){
  const latest = stages.at(-1);
  if(!latest){
    byId('latestStage').innerHTML = `<p class="empty">Nog geen ritresultaten. Na rit 1 verschijnt hier de ritwinnaar en de update.</p>`;
    byId('stageScores').innerHTML = `<p class="empty">Nog geen dagpunten.</p>`;
    return;
  }
  byId('latestStage').innerHTML = `
    <p class="tag">Rit ${latest.number}</p>
    <h3>${latest.name}</h3>
    <p>Ritwinnaar: <strong>${latest.results[0] || 'Nog niet ingevuld'}</strong></p>
    <p class="empty">Top 25 verwerkt voor de pronostiek.</p>`;

  const day = players.map(p => ({name:p.name, points:scoreStage(p, latest)})).sort((a,b)=>b.points-a.points || a.name.localeCompare(b.name));
  byId('stageScores').innerHTML = `<div class="score-list">${day.map((p,i)=>`
    <div class="score-row"><strong>${i+1}. ${p.name}</strong><span>${p.points} punten</span></div>`).join('')}</div>`;
}

function renderTeams(players){
  byId('teamsGrid').innerHTML = players.map(p => `
    <article class="panel team-card">
      <div class="team-head">
        <div><p class="tag">${3 - (p.transfersUsed || 0)} wissels over</p><h3>${p.name}</h3></div>
        <span class="pill">⭐ ${p.captain}</span>
      </div>
      <ul class="riders">
        ${p.riders.map(r => `<li class="${r === p.captain ? 'captain' : ''}"><span>${r === p.captain ? '⭐ ' : ''}${r}</span></li>`).join('')}
      </ul>
    </article>`).join('');
}

function renderPredictions(players){
  byId('predictionBody').innerHTML = players.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.predictions.yellow}</td>
      <td>${p.predictions.green}</td>
      <td>${p.predictions.polka}</td>
      <td>${p.predictions.white}</td>
    </tr>`).join('');
}

getData().then(data => {
  const players = data.players || [];
  const stages = data.stages || [];
  renderRanking(players, stages);
  renderLatest(players, stages);
  renderTeams(players);
  renderPredictions(players);
}).catch(error => {
  document.body.insertAdjacentHTML('afterbegin', `<div style="padding:12px 16px;background:#ff6b6b;color:#111;font-weight:900">Data kon niet geladen worden: ${error.message}</div>`);
});
