const data = window.TOUR_DATA;
const $ = (id) => document.getElementById(id);
const sorted = [...data.participants].sort((a,b)=>b.points-a.points || a.name.localeCompare(b.name));

function medal(i){ return i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1); }
function predictionIcon(key){ return {geel:'🟡', groen:'🟢', bolletjes:'🔴⚪', wit:'⚪'}[key] || '•'; }
function label(key){ return {geel:'Gele trui', groen:'Groene trui', bolletjes:'Bolletjestrui', wit:'Witte trui'}[key] || key; }

function renderHero(){
  $('participantCount').textContent = data.participants.length;
  $('stageCount').textContent = data.stages.length;
  if(sorted[0] && sorted[0].points > 0){
    $('leaderName').textContent = sorted[0].name;
    $('leaderPoints').textContent = `${sorted[0].points} punten`;
  }
}

function renderStats(){
  const totalTransfers = data.participants.reduce((sum,p)=>sum+p.transfersLeft,0);
  $('dashboard').innerHTML = [
    ['🏆','Leider', sorted[0]?.points ? sorted[0].name : 'Nog open'],
    ['👥','Deelnemers', data.participants.length],
    ['⭐','Kopmannen', data.participants.filter(p=>p.captain).length],
    ['🔄','Wissels over', totalTransfers]
  ].map(([icon,title,value])=>`<article class="stat-card"><span>${icon}</span><p>${title}</p><strong>${value}</strong></article>`).join('');
}

function renderStandings(){
  $('standingsBody').innerHTML = sorted.map((p,i)=>`
    <tr>
      <td class="rank">${medal(i)}</td>
      <td><strong>${p.avatar} ${p.name}</strong></td>
      <td><strong>${p.points}</strong></td>
      <td>⭐ ${p.captain}</td>
      <td>${'●'.repeat(p.transfersLeft)}${'○'.repeat(3-p.transfersLeft)}</td>
    </tr>
  `).join('');
}

function renderTeams(){
  $('teamGrid').innerHTML = data.participants.map(p=>`
    <article class="team-card">
      <div class="team-head"><div class="avatar">${p.avatar}</div><div><h3>${p.name}</h3><p>⭐ Kopman: ${p.captain}</p></div></div>
      <ol class="rider-list">${p.riders.map(r=>`<li class="${r===p.captain?'captain':''}">${r}${r===p.captain?' <span>kopman</span>':''}</li>`).join('')}</ol>
      <div class="card-foot"><span>Wissels over</span><strong>${p.transfersLeft}/3</strong></div>
    </article>
  `).join('');
}

function renderPredictions(){
  $('predictionGrid').innerHTML = data.participants.map(p=>`
    <article class="prediction-card">
      <h3>${p.avatar} ${p.name}</h3>
      ${Object.entries(p.predictions).map(([k,v])=>`<div><span>${predictionIcon(k)} ${label(k)}</span><strong>${v}</strong></div>`).join('')}
    </article>
  `).join('');
}

function renderLatestStage(){
  if(data.stages.length){
    const s = data.stages[data.stages.length - 1];
    $('latestStageLabel').textContent = s.name;
    $('latestStage').innerHTML = `<strong>${s.winner}</strong><p>${s.summary || ''}</p>`;
  }
}

renderHero(); renderStats(); renderStandings(); renderTeams(); renderPredictions(); renderLatestStage();
