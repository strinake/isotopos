// Configuration
const ISOTOPOS_ID = 'isotopos';

// Global Supabase client
let supabaseClient;

// Global state
let data = {
  teams: [],
  matches: [],
  scorers: [],
  mvp: []
};

// Initialize app
async function init() {
  // Init Supabase
  if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== 'TU_SUPABASE_PROJECT_URL') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.error("Supabase init error:", e);
      showError('Error inicializando Supabase.');
      return;
    }
  } else {
    showError('Configuración de Supabase incompleta. Por favor rellena config.js con tus credenciales.');
    return;
  }

  initNavigation();
  await loadData();
}

// Execute initialization based on document state
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already loaded, execute immediately
  init();
}

// Navigation
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonId = e.target.id;
      const sectionName = buttonId.replace('btn-', '');

      // Update active button
      navButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Update active section
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(`section-${sectionName}`).classList.add('active');
    });
  });
}

// Load data from Supabase
async function loadData() {
  try {
    const [teamsRes, matchesRes, scorersRes, mvpRes] = await Promise.all([
      supabaseClient.from('teams').select('*'),
      supabaseClient.from('matches').select('*'),
      supabaseClient.from('scorers').select('*'),
      supabaseClient.from('mvp').select('*')
    ]);

    if (teamsRes.error) throw teamsRes.error;
    if (matchesRes.error) throw matchesRes.error;
    if (scorersRes.error) throw scorersRes.error;
    if (mvpRes.error) throw mvpRes.error;

    // Map data to internal structure
    data.teams = teamsRes.data.map(t => ({
      id: t.id,
      name: t.name,
      shortName: t.short_name
    }));

    data.matches = matchesRes.data.map(m => ({
      id: m.id,
      jornada: m.jornada,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeScore: m.home_score,
      awayScore: m.away_score,
      venue: m.venue,
      date: m.match_date,
      time: m.match_time
    }));

    data.scorers = scorersRes.data.map(s => ({
      playerId: s.player_id,
      playerName: s.player_name,
      teamId: s.team_id,
      goals: s.goals,
      assists: s.assists
    }));

    data.mvp = mvpRes.data.map(p => ({
      playerId: p.player_id,
      playerName: p.player_name,
      teamId: p.team_id,
      points: p.points
    }));

    // Render all sections
    renderClasificacion();
    renderGoleadores();
    renderMVP();
    renderResultados();
    renderResultados();
    renderUpcomingMatches();

    // Admin init
    initAdmin();
    renderAdmin();
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    showError('Error al conectar con la base de datos. Verifica tu conexión y configuración en config.js');
  }
}

// Calculate standings from matches
function calculateStandings() {
  const standings = {};

  // Initialize standings for all teams
  data.teams.forEach(team => {
    standings[team.id] = {
      team: team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  });

  // Process matches
  data.matches.forEach(match => {
    // Skip if match hasn't been played (no scores)
    if (match.homeScore === null || match.awayScore === null) return;

    const homeTeam = standings[match.homeTeamId];
    const awayTeam = standings[match.awayTeamId];

    if (!homeTeam || !awayTeam) return;

    homeTeam.played++;
    awayTeam.played++;

    homeTeam.goalsFor += match.homeScore;
    homeTeam.goalsAgainst += match.awayScore;
    awayTeam.goalsFor += match.awayScore;
    awayTeam.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeTeam.won++;
      homeTeam.points += 3;
      awayTeam.lost++;
    } else if (match.homeScore < match.awayScore) {
      awayTeam.won++;
      awayTeam.points += 3;
      homeTeam.lost++;
    } else {
      homeTeam.drawn++;
      awayTeam.drawn++;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }
  });

  // Calculate goal difference
  Object.values(standings).forEach(team => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
  });

  // Sort by points, then goal difference, then goals for
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

// Render Clasificación
function renderClasificacion() {
  const tbody = document.getElementById('tbody-clasificacion');
  const standings = calculateStandings();

  if (standings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="loading">No hay datos disponibles</td></tr>';
    return;
  }

  tbody.innerHTML = standings.map((team, index) => {
    const position = index + 1;
    const isIsotopos = team.team.id === ISOTOPOS_ID;
    const rowClass = isIsotopos ? 'highlight-isotopos' : '';
    const posClass = position <= 3 ? 'top-3' : '';
    const teamNameClass = isIsotopos ? 'team-name' : '';

    return `
      <tr class="${rowClass}">
        <td class="center">
          <span class="position ${posClass}">${position}</span>
        </td>
        <td class="${teamNameClass}">${team.team.name}</td>
        <td class="center">${team.played}</td>
        <td class="center">${team.won}</td>
        <td class="center">${team.drawn}</td>
        <td class="center">${team.lost}</td>
        <td class="center">${team.goalsFor}</td>
        <td class="center">${team.goalsAgainst}</td>
        <td class="center">${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}</td>
        <td class="center"><strong>${team.points}</strong></td>
      </tr>
    `;
  }).join('');
}

// Render Goleadores
function renderGoleadores() {
  const container = document.getElementById('list-goleadores');

  // Sort scorers by goals
  const sortedScorers = [...data.scorers].sort((a, b) => b.goals - a.goals);

  if (sortedScorers.length === 0) {
    container.innerHTML = '<div class="loading">No hay datos disponibles</div>';
    return;
  }

  container.innerHTML = sortedScorers.map((scorer, index) => {
    const position = index + 1;
    const team = data.teams.find(t => t.id === scorer.teamId);
    const isIsotopos = scorer.teamId === ISOTOPOS_ID;
    const itemClass = isIsotopos ? 'highlight-isotopos' : '';
    const posClass = position <= 3 ? 'top-3' : '';
    const teamClass = isIsotopos ? 'isotopos' : '';

    return `
      <div class="player-item ${itemClass}">
        <div class="player-info">
          <div class="player-position ${posClass}">${position}</div>
          <div class="player-details">
            <div class="player-name">${scorer.playerName}</div>
            <div class="player-team ${teamClass}">${team ? team.name : 'N/A'}</div>
          </div>
        </div>
        <div class="player-stats">${scorer.goals} ⚽ | ${scorer.assists || 0} 🅰️</div>
      </div>
    `;
  }).join('');
}

// Render MVP
function renderMVP() {
  const container = document.getElementById('list-mvp');

  // Sort MVP by points
  const sortedMVP = [...data.mvp].sort((a, b) => b.points - a.points);

  if (sortedMVP.length === 0) {
    container.innerHTML = '<div class="loading">No hay datos disponibles</div>';
    return;
  }

  container.innerHTML = sortedMVP.map((mvp, index) => {
    const position = index + 1;
    const team = data.teams.find(t => t.id === mvp.teamId);
    const isIsotopos = mvp.teamId === ISOTOPOS_ID;
    const itemClass = isIsotopos ? 'highlight-isotopos' : '';
    const posClass = position <= 3 ? 'top-3' : '';
    const teamClass = isIsotopos ? 'isotopos' : '';

    return `
      <div class="player-item ${itemClass}">
        <div class="player-info">
          <div class="player-position ${posClass}">${position}</div>
          <div class="player-details">
            <div class="player-name">${mvp.playerName}</div>
            <div class="player-team ${teamClass}">${team ? team.name : 'N/A'}</div>
          </div>
        </div>
        <div class="player-stats">${mvp.points} pts</div>
      </div>
    `;
  }).join('');
}

// Render Resultados
function renderResultados() {
  const container = document.getElementById('container-resultados');

  // Group matches by jornada
  const matchesByJornada = {};
  data.matches.forEach(match => {
    // Hide unplayed matches (results not filled)
    if (match.homeScore === null || match.awayScore === null) return;

    if (!matchesByJornada[match.jornada]) {
      matchesByJornada[match.jornada] = [];
    }
    matchesByJornada[match.jornada].push(match);
  });

  if (Object.keys(matchesByJornada).length === 0) {
    container.innerHTML = '<div class="loading">No hay datos disponibles</div>';
    return;
  }

  // Sort jornadas
  const sortedJornadas = Object.keys(matchesByJornada).sort((a, b) => b - a);

  container.innerHTML = sortedJornadas.map(jornada => {
    const matches = matchesByJornada[jornada];

    const matchesHTML = matches.map(match => {
      const homeTeam = data.teams.find(t => t.id === match.homeTeamId);
      const awayTeam = data.teams.find(t => t.id === match.awayTeamId);

      const isIsotoposMatch = match.homeTeamId === ISOTOPOS_ID || match.awayTeamId === ISOTOPOS_ID;
      const matchClass = isIsotoposMatch ? 'highlight-isotopos' : '';

      const homeClass = match.homeTeamId === ISOTOPOS_ID ? 'isotopos' : '';
      const awayClass = match.awayTeamId === ISOTOPOS_ID ? 'isotopos' : '';

      const hasPlayed = match.homeScore !== null && match.awayScore !== null;

      let scoreContent;
      if (hasPlayed) {
        scoreContent = `
            <span>${match.homeScore}</span>
            <span class="score-separator">-</span>
            <span>${match.awayScore}</span>
        `;
      } else {
        const date = match.date ? new Date(match.date).toLocaleDateString() : 'Por determinar';
        scoreContent = `
            <div class="upcoming-info">
                <span class="match-vs">VS</span>
                <div class="match-meta">
                    <span class="match-time">${match.time || '--:--'}</span>
                    <span class="match-venue text-muted">${match.venue || ''}</span>
                    <span class="match-date text-muted">${date}</span>
                </div>
            </div>
        `;
      }

      return `
        <div class="match-card ${matchClass} ${!hasPlayed ? 'upcoming' : ''}">
          <div class="team home ${homeClass}">
            ${homeTeam ? homeTeam.name : 'N/A'}
          </div>
          <div class="score ${!hasPlayed ? 'upcoming-score' : ''}">
            ${scoreContent}
          </div>
          <div class="team away ${awayClass}">
            ${awayTeam ? awayTeam.name : 'N/A'}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="jornada-group">
        <h3 class="jornada-title">Jornada ${jornada}</h3>
        <div class="matches-grid">
          ${matchesHTML}
        </div>
      </div>
    `;
  }).join('');
}


// Render Upcoming Matches
function renderUpcomingMatches() {
  const container = document.getElementById('container-proximos');

  if (!container) return;

  // Filter matches that haven't been played (no score)
  const upcomingMatches = data.matches.filter(m => m.homeScore === null || m.awayScore === null);

  if (upcomingMatches.length === 0) {
    container.innerHTML = '<div class="loading">No hay partidos programados</div>';
    return;
  }

  // Group by jornada
  const matchesByJornada = {};
  upcomingMatches.forEach(match => {
    if (!matchesByJornada[match.jornada]) {
      matchesByJornada[match.jornada] = [];
    }
    matchesByJornada[match.jornada].push(match);
  });

  // Sort matches within each jornada by date and time
  Object.keys(matchesByJornada).forEach(jornada => {
    matchesByJornada[jornada].sort((a, b) => {
      // Compare dates
      const dateA = a.date || '9999-12-31';
      const dateB = b.date || '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);

      // If dates equal, compare times
      const timeA = a.time || '23:59';
      const timeB = b.time || '23:59';
      return timeA.localeCompare(timeB);
    });
  });

  // Sort jornadas ascending (closest first) and take next 10
  const sortedJornadas = Object.keys(matchesByJornada)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .slice(0, 10);

  container.innerHTML = sortedJornadas.map(jornada => {
    const matches = matchesByJornada[jornada];

    const matchesHTML = matches.map(match => {
      const homeTeam = data.teams.find(t => t.id === match.homeTeamId);
      const awayTeam = data.teams.find(t => t.id === match.awayTeamId);

      const isIsotoposMatch = match.homeTeamId === ISOTOPOS_ID || match.awayTeamId === ISOTOPOS_ID;
      const matchClass = isIsotoposMatch ? 'highlight-isotopos' : '';
      const homeClass = match.homeTeamId === ISOTOPOS_ID ? 'isotopos' : '';
      const awayClass = match.awayTeamId === ISOTOPOS_ID ? 'isotopos' : '';

      // Format date
      let dateStr = 'Por determinar';
      if (match.date) {
        try {
          const dateObj = new Date(match.date);
          const options = { weekday: 'short', day: 'numeric', month: 'short' };
          dateStr = dateObj.toLocaleDateString('es-ES', options);
        } catch (e) {
          console.warn('Invalid date:', match.date);
        }
      }

      return `
        <div class="match-card upcoming ${matchClass}">
          <div class="team home ${homeClass}">
            ${homeTeam ? homeTeam.name : 'N/A'}
          </div>

          <div class="match-info-center">
             <div class="vs-badge">VS</div>
             <div class="match-details">
                <span class="match-date">${dateStr}</span>
                <span class="match-time">${match.time ? match.time.substring(0, 5) : '--:--'}</span>
                <span class="match-venue">${match.venue || 'Sede por confirmar'}</span>
             </div>
          </div>

          <div class="team away ${awayClass}">
            ${awayTeam ? awayTeam.name : 'N/A'}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="jornada-group">
        <h3 class="jornada-title">Jornada ${jornada}</h3>
        <div class="matches-grid">
          ${matchesHTML}
        </div>
      </div>
    `;
  }).join('');
}

// Show error
function showError(message) {
  const sections = ['clasificacion', 'goleadores', 'mvp', 'resultados', 'proximos', 'admin'];
  sections.forEach(section => {
    const element = document.getElementById(
      section === 'clasificacion' ? 'tbody-clasificacion' :
        section === 'resultados' ? 'container-resultados' :
          section === 'proximos' ? 'container-proximos' :
            section === 'admin' ? 'container-admin' :
              `list-${section}`
    );
    if (element) {
      element.innerHTML = `<div class="error">${message}</div>`;
    }
  });
}

// --- ADMIN LOGIC ---

let adminCurrentJornada = 1;

function initAdmin() {
  const jornadaSelect = document.getElementById('admin-jornada-select');
  const addButton = document.getElementById('btn-add-match');

  if (!jornadaSelect) return;

  // Populate Jornada Select
  const jornadas = [...new Set(data.matches.map(m => m.jornada))].sort((a, b) => a - b);
  // If no jornadas, default to 1
  if (jornadas.length === 0) jornadas.push(1);

  jornadaSelect.innerHTML = jornadas.map(j => `<option value="${j}">${j}</option>`).join('');

  // Set default to next upcoming or last played
  // Simple logic: max existing jornada
  const maxJornada = Math.max(...jornadas);
  jornadaSelect.value = maxJornada;
  adminCurrentJornada = maxJornada;

  jornadaSelect.addEventListener('change', (e) => {
    adminCurrentJornada = parseInt(e.target.value);
    renderAdmin();
  });

  if (addButton) {
    addButton.addEventListener('click', () => {
      addNewMatch();
    });
  }

  // Render other admin sections
  renderAdminScorers();
  renderAdminMVP();
}

window.switchAdminTab = function (tabName) {
  // Update Tabs
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');

  // Update Sections
  const sections = ['matches', 'scorers', 'mvp'];
  sections.forEach(s => {
    const el = document.getElementById(`admin-${s}`);
    if (el) {
      el.style.display = s === tabName ? 'block' : 'none';
      if (s === tabName) el.classList.add('active');
    }
  });
};

function renderAdmin() {
  const container = document.getElementById('container-admin');
  if (!container) return;

  const matches = data.matches.filter(m => m.jornada === adminCurrentJornada);

  // Sort matches by time or id
  matches.sort((a, b) => (a.id > b.id) ? 1 : -1);

  if (matches.length === 0) {
    container.innerHTML = '<div class="loading">No hay partidos en esta jornada. Pulsa "Añadir Partido" para crear uno.</div>';
    // return; // Don't return, we might want to see empty state
  } else {
    container.innerHTML = matches.map(match => renderAdminMatchCard(match)).join('');
  }
}

function renderAdminMatchCard(match) {
  const teamsOptions = data.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

  // Helper to select correct team
  const teamSelect = (selectedId) => {
    return data.teams.map(t => `<option value="${t.id}" ${t.id === selectedId ? 'selected' : ''}>${t.name}</option>`).join('');
  };

  return `
    <div class="admin-match-card" id="admin-card-${match.id}">
        <div class="admin-row">
            <div class="admin-team">
                <label>Local</label>
                <select id="home-${match.id}">${teamSelect(match.homeTeamId)}</select>
            </div>
            
            <div class="admin-score-group">
                <input type="number" id="score-home-${match.id}" class="admin-input-score" value="${match.homeScore !== null ? match.homeScore : ''}" placeholder="-">
                <span>-</span>
                <input type="number" id="score-away-${match.id}" class="admin-input-score" value="${match.awayScore !== null ? match.awayScore : ''}" placeholder="-">
            </div>
            
            <div class="admin-team">
                <label>Visitante</label>
                <select id="away-${match.id}">${teamSelect(match.awayTeamId)}</select>
            </div>
        </div>
        
        <div class="admin-meta">
            <div class="meta-field">
                <label>Jornada</label>
                <input type="number" id="jornada-${match.id}" value="${match.jornada}" style="width: 60px;">
            </div>
            <div class="meta-field">
                <label>Fecha</label>
                <input type="date" id="date-${match.id}" value="${match.date || ''}">
            </div>
            <div class="meta-field">
                <label>Hora</label>
                <input type="time" id="time-${match.id}" value="${match.time || ''}">
            </div>
             <div class="meta-field">
                <label>Sede</label>
                <input type="text" id="venue-${match.id}" value="${match.venue || ''}" placeholder="Sede">
            </div>
            <div class="admin-actions">
                <button class="btn-save" onclick="saveMatch('${match.id}')">💾 Guardar</button>
                <button class="btn-delete" onclick="deleteMatch('${match.id}')">🗑️</button>
            </div>
        </div>
    </div>
    `;
}

// Make functions global for onclick events
window.saveMatch = async function (matchId) {
  const card = document.getElementById(`admin-card-${matchId}`);
  const saveBtn = card.querySelector('.btn-save');
  const originalText = saveBtn.innerText;
  saveBtn.innerText = '...';
  saveBtn.disabled = true;

  try {
    const homeTeamId = document.getElementById(`home-${matchId}`).value;
    const awayTeamId = document.getElementById(`away-${matchId}`).value;
    const homeScoreVal = document.getElementById(`score-home-${matchId}`).value;
    const awayScoreVal = document.getElementById(`score-away-${matchId}`).value;
    const date = document.getElementById(`date-${matchId}`).value;
    const time = document.getElementById(`time-${matchId}`).value;
    const venue = document.getElementById(`venue-${matchId}`).value;
    const newJornada = parseInt(document.getElementById(`jornada-${matchId}`).value);

    const homeScore = homeScoreVal === '' ? null : parseInt(homeScoreVal);
    const awayScore = awayScoreVal === '' ? null : parseInt(awayScoreVal);

    const updates = {
      id: matchId,
      jornada: newJornada, // Use the new value
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      home_score: homeScore,
      away_score: awayScore,
      match_date: date || null,
      match_time: time || null,
      venue: venue || null
    };

    const { error } = await supabaseClient.from('matches').upsert(updates);

    if (error) throw error;

    // Update local data
    const index = data.matches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      data.matches[index] = {
        ...data.matches[index],
        jornada: newJornada,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        homeScore: homeScore,
        awayScore: awayScore,
        date: date || null,
        time: time || null,
        venue: venue || null
      };

      // If jornada changed, match should disappear from current admin view
      if (newJornada !== adminCurrentJornada && adminCurrentJornada !== undefined) {
        const cardEl = document.getElementById(`admin-card-${matchId}`);
        if (cardEl) {
          cardEl.style.transition = 'opacity 0.5s';
          cardEl.style.opacity = '0';
          setTimeout(() => cardEl.remove(), 500);
        }
      }
    }
    else {
      // New match that was just saved
      data.matches.push({
        id: matchId,
        jornada: adminCurrentJornada,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        homeScore: homeScore,
        awayScore: awayScore,
        date: date || null,
        time: time || null,
        venue: venue || null
      });
    }

    saveBtn.innerText = '✅';
    setTimeout(() => {
      saveBtn.innerText = originalText;
      saveBtn.disabled = false;
      // Re-render other views to reflect changes
      renderClasificacion();
      renderResultados();
      renderUpcomingMatches();
    }, 1000);

  } catch (error) {
    console.error('Error saving match:', error);
    alert('Error al guardar: ' + error.message);
    saveBtn.innerText = originalText;
    saveBtn.disabled = false;
  }
};

window.addNewMatch = function () {
  const newId = 'new_' + Date.now();
  const container = document.getElementById('container-admin');

  // Create new match object placeholder
  const newMatch = {
    id: newId,
    jornada: adminCurrentJornada,
    homeTeamId: data.teams[0].id,
    awayTeamId: data.teams[1].id,
    homeScore: null,
    awayScore: null,
    date: null,
    time: null,
    venue: ''
  };

  // Add to top of admin view (not to data yet until saved)
  // Actually simpler to just push to data and render, but user might cancel.
  // Let's prepend the HTML
  const html = renderAdminMatchCard(newMatch);

  // Insert after the loading spinner or at top
  // Ideally we re-render, but let's just create a temp element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  container.insertBefore(tempDiv.firstElementChild, container.firstChild);
};

window.deleteMatch = async function (matchId) {
  if (!confirm('¿Estás seguro de querer eliminar este partido?')) return;

  try {
    if (!matchId.startsWith('new_')) {
      const { error } = await supabaseClient.from('matches').delete().eq('id', matchId);
      if (error) throw error;
    }

    // Remove from local data
    data.matches = data.matches.filter(m => m.id !== matchId);

    // Remove from DOM
    const card = document.getElementById(`admin-card-${matchId}`);
    if (card) card.remove();

    renderClasificacion();
    renderResultados();
    renderUpcomingMatches();

  } catch (error) {
    console.error('Error deleting match:', error);
    alert('Error al borrar: ' + error.message);
  }
};


// --- ADMIN SCORERS ---

function renderAdminScorers() {
  const container = document.getElementById('container-admin-scorers');
  if (!container) return;

  // Sort by goals desc
  const sortedScorers = [...data.scorers].sort((a, b) => b.goals - a.goals);

  if (sortedScorers.length === 0) {
    container.innerHTML = '<div class="loading">No hay goleadores. Añade uno.</div>';
  } else {
    container.innerHTML = sortedScorers.map(scorer => renderAdminScorerCard(scorer)).join('');
  }
}

function renderAdminScorerCard(scorer) {
  return `
    <div class="admin-match-card" id="admin-scorer-${scorer.playerId}">
        <div class="admin-row" style="grid-template-columns: 2fr 1fr 1fr;">
            <div class="meta-field">
                <label>Jugador</label>
                <input type="text" id="scorer-name-${scorer.playerId}" value="${scorer.playerName}" placeholder="Nombre">
            </div>
            
             <div class="meta-field">
                <label>Goles</label>
                <input type="number" id="scorer-goals-${scorer.playerId}" value="${scorer.goals}" style="width: 60px;">
            </div>
            
            <div class="meta-field">
                <label>Asist.</label>
                <input type="number" id="scorer-assists-${scorer.playerId}" value="${scorer.assists || 0}" style="width: 60px;">
            </div>
        </div>
        
        <div class="admin-actions" style="margin-top: 0.5rem; justify-content: flex-end;">
            <button class="btn-save" onclick="saveScorer('${scorer.playerId}')">💾 Guardar</button>
            <button class="btn-delete" onclick="deleteScorer('${scorer.playerId}')">🗑️</button>
        </div>
    </div>
    `;
}

window.addNewScorer = function () {
  const newId = 'new_' + Date.now();
  const container = document.getElementById('container-admin-scorers');

  const newScorer = {
    playerId: newId,
    playerName: '',
    teamId: ISOTOPOS_ID,
    goals: 0,
    assists: 0
  };

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderAdminScorerCard(newScorer);
  container.insertBefore(tempDiv.firstElementChild, container.firstChild);
};

window.saveScorer = async function (id) {
  const card = document.getElementById(`admin-scorer-${id}`);
  const saveBtn = card.querySelector('.btn-save');
  const originalText = saveBtn.innerText;
  saveBtn.innerText = '...';
  saveBtn.disabled = true;

  try {
    const name = document.getElementById(`scorer-name-${id}`).value;
    // Default team constant
    const teamId = ISOTOPOS_ID;
    const goals = parseInt(document.getElementById(`scorer-goals-${id}`).value);
    const assists = parseInt(document.getElementById(`scorer-assists-${id}`).value);

    const updates = {
      player_name: name,
      team_id: teamId,
      goals: goals,
      assists: assists
    };

    // If not new, include ID
    if (!id.startsWith('new_')) {
      updates.player_id = id;
    }

    const { data: savedData, error } = await supabaseClient.from('scorers').upsert(updates).select();

    if (error) throw error;

    // Reload data to get real ID if new
    await loadData(); // Easiest way to sync state definitively
    renderAdminScorers(); // Re-render this view

    saveBtn.innerText = '✅';
  } catch (error) {
    console.error('Error saving scorer:', error);
    alert('Error: ' + error.message);
    saveBtn.innerText = originalText;
    saveBtn.disabled = false;
  }
};

window.deleteScorer = async function (id) {
  if (!confirm('¿Borrar este jugador?')) return;
  try {
    if (!id.startsWith('new_')) {
      const { error } = await supabaseClient.from('scorers').delete().eq('player_id', id);
      if (error) throw error;
    }

    // Update local
    data.scorers = data.scorers.filter(s => s.playerId != id);
    renderAdminScorers();
    renderGoleadores(); // Update public view
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


// --- ADMIN MVP ---

function renderAdminMVP() {
  const container = document.getElementById('container-admin-mvp');
  if (!container) return;

  const sortedMVP = [...data.mvp].sort((a, b) => b.points - a.points);

  if (sortedMVP.length === 0) {
    container.innerHTML = '<div class="loading">No hay datos MVP. Añade uno.</div>';
  } else {
    container.innerHTML = sortedMVP.map(p => renderAdminMVPCard(p)).join('');
  }
}

function renderAdminMVPCard(player) {
  return `
    <div class="admin-match-card" id="admin-mvp-${player.playerId}">
        <div class="admin-row" style="grid-template-columns: 2fr 1fr;">
            <div class="meta-field">
                <label>Jugador</label>
                <input type="text" id="mvp-name-${player.playerId}" value="${player.playerName}" placeholder="Nombre">
            </div>
            
             <div class="meta-field">
                <label>Puntos</label>
                <input type="number" id="mvp-points-${player.playerId}" value="${player.points}" style="width: 80px;">
            </div>
        </div>
        
        <div class="admin-actions" style="margin-top: 0.5rem; justify-content: flex-end;">
            <button class="btn-save" onclick="saveMVP('${player.playerId}')">💾 Guardar</button>
            <button class="btn-delete" onclick="deleteMVP('${player.playerId}')">🗑️</button>
        </div>
    </div>
    `;
}

window.addNewMVP = function () {
  const newId = 'new_' + Date.now();
  const container = document.getElementById('container-admin-mvp');

  const newObj = {
    playerId: newId,
    playerName: '',
    teamId: ISOTOPOS_ID,
    points: 0
  };

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderAdminMVPCard(newObj);
  container.insertBefore(tempDiv.firstElementChild, container.firstChild);
};

window.saveMVP = async function (id) {
  const card = document.getElementById(`admin-mvp-${id}`);
  const saveBtn = card.querySelector('.btn-save');
  const originalText = saveBtn.innerText;
  saveBtn.innerText = '...';
  saveBtn.disabled = true;

  try {
    const name = document.getElementById(`mvp-name-${id}`).value;
    const teamId = ISOTOPOS_ID;
    const points = parseInt(document.getElementById(`mvp-points-${id}`).value);

    const updates = {
      player_name: name,
      team_id: teamId,
      points: points
    };

    if (!id.startsWith('new_')) {
      updates.player_id = id;
    }

    const { error } = await supabaseClient.from('mvp').upsert(updates);
    if (error) throw error;

    await loadData();
    renderAdminMVP();

    saveBtn.innerText = '✅';
  } catch (error) {
    console.error('Error saving MVP:', error);
    alert('Error: ' + error.message);
    saveBtn.innerText = originalText;
    saveBtn.disabled = false;
  }
};

window.deleteMVP = async function (id) {
  if (!confirm('¿Borrar?')) return;
  try {
    if (!id.startsWith('new_')) {
      const { error } = await supabaseClient.from('mvp').delete().eq('player_id', id);
      if (error) throw error;
    }
    data.mvp = data.mvp.filter(s => s.playerId != id);
    renderAdminMVP();
    renderMVP();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


// --- ADMIN LOGIN LOGIC ---

window.checkAdminLogin = function () {
  const userField = document.getElementById('login-user');
  const passField = document.getElementById('login-pass');
  const errorMsg = document.getElementById('login-error');

  if (!userField || !passField) return;

  const user = userField.value;
  const pass = passField.value;

  // Credentials (client-side check as requested)
  // User: isotopos, Pass: isotopos25
  if (user === 'isotopos' && pass === 'isotopos25') {
    sessionStorage.setItem('isotopos_admin_logged_in', 'true');
    showAdminPanel();

    // Hide error if it was shown
    if (errorMsg) errorMsg.style.display = 'none';
  } else {
    if (errorMsg) {
      errorMsg.style.display = 'block';
      errorMsg.innerText = 'Credenciales incorrectas. Inténtalo de nuevo.';
    }
    // Shake animation effect for visual feedback
    const card = document.querySelector('.login-card');
    if (card) {
      card.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
      setTimeout(() => card.style.animation = '', 400);
    }
  }
};

window.showAdminPanel = function () {
  const loginDiv = document.getElementById('admin-login');
  const panelDiv = document.getElementById('admin-panel');

  if (loginDiv) loginDiv.style.display = 'none';
  if (panelDiv) {
    panelDiv.style.display = 'block';
    panelDiv.style.animation = 'fadeIn 0.5s ease-out';
  }
}

// Add CSS keyframes for shake manually or assume checkAdminLogin handles logic
// Let's add the startup check
document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = sessionStorage.getItem('isotopos_admin_logged_in') === 'true';
  if (isLoggedIn) {
    showAdminPanel();
  }

  // Add Enter key listener for login
  const handleLoginEnter = (e) => {
    if (e.key === 'Enter') checkAdminLogin();
  };

  const userField = document.getElementById('login-user');
  const passField = document.getElementById('login-pass');

  if (userField) userField.addEventListener('keypress', handleLoginEnter);
  if (passField) passField.addEventListener('keypress', handleLoginEnter);
});
