const POINTS = {1:30,2:25,3:20,4:18,5:16,6:14,7:12,8:10,9:9,10:8};
const rangePoints = (place) => place <= 10 ? POINTS[place] : place <= 15 ? 5 : place <= 20 ? 3 : place <= 25 ? 1 : 0;

async function loadData(){
  const response = await fetch('data/tour-data.json', {cache:'no-store'});
  return response.json();
}

function riderScoreForStage(player, stage){
  if(!stage || !stage.results) return 0;
  let total = 0;
  stage.results.forEach((name, index) => {
    const place = index + 1;
    if(player.riders.includes(name)){
      const base = rangePoints(place);
      total += name === player.captain ? base * 2 : base;
    }
  });
  return total;
}

function totalScore(player, stages){
  return stages.reduce((sum, stage) => sum + riderScoreForStage(player, stage), 0);
}

function render(data){
  const stages = data.stages || [];
  const players = data.players.map(player => ({...player, points: totalScore(player, stages)}))
    .sort((a,b)=> b.points - a.points || a.name.localeCompare(b.name));

  document.getElementById('statPlayers').textContent = players.length;
  document.getElementById('statStages').textContent = stages.length;

  const leader = players[0];
  document.getElementById('currentLeader').textContent = leader && leader.points > 0 ? leader.name : 'Nog geen punten';
  document.getElementById('leaderPoints').textContent = leader && leader.points > 0 ? `${leader.points} punten` : 'Startklaar voor rit 1';

  document.getElementById('rankingBody').innerHTML = players.map((p,i)=>`
    <tr>
      <td class="rank">${i+1}</td>
      <td><strong>${p.name}</strong></td>
      <td><strong>${p.points}</strong></td>
      <td><span class="pill">⭐ ${p.captain}</span></td>
      <td>${3 - (p.transfersUsed || 0)}</td>
    </tr>`).join('');

  const last = stages[stages.length-1];
  document.getElementById('lastStageCard').innerHTML = last ? `
    <p class="eyebrow">Rit ${last.number}</p>
    <h3>${last.name}</h3>
    <p>Winnaar: <strong>${last.results?.[0] || 'Nog niet ingevuld'}</strong></p>
  ` : `<p class="stage-empty">Nog geen ritresultaten. Na rit 1 verschijnt hier de dagwinnaar en de update.</p>`;

  document.getElementById('teamsGrid').innerHTML = data.players.map(p=>`
    <article class="card team-card">
      <div class="team-head">
        <div><p class="eyebrow">${3 - (p.transfersUsed || 0)} wissels over</p><h3>${p.name}</h3></div>
        <span class="pill">⭐ ${p.captain}</span>
      </div>
      <ul class="riders">${p.riders.map(r=>`<li><span class="${r===p.captain?'captain':''}">${r===p.captain?'⭐ ':''}${r}</span></li>`).join('')}</ul>
    </article>`).join('');

  document.getElementById('predictionBody').innerHTML = data.players.map(p=>`
    <tr><td><strong>${p.name}</strong></td><td>${p.predictions.yellow}</td><td>${p.predictions.green}</td><td>${p.predictions.polka}</td><td>${p.predictions.white}</td></tr>
  `).join('');
}

loadData().then(render).catch(err => {
  document.body.insertAdjacentHTML('afterbegin', `<div style="padding:12px;background:#ff6b6b;color:#111;font-weight:800">Data kon niet geladen worden. Controleer of data/tour-data.json bestaat.</div>`);
  console.error(err);
});
