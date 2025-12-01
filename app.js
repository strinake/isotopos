// Configuration
const DATA_URL = 'data.json';
const ISOTOPOS_ID = 'isotopos';

// Global state
let data = {
  teams: [],
  matches: [],
  scorers: [],
  mvp: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadData();
});

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

// Load data from inline JSON script in index.html
function loadData() {
  try {
    const script = document.getElementById('data-json');
    if (!script) {
      throw new Error('No se encontró el bloque de datos embebido (script#data-json).');
    }

    data = JSON.parse(script.textContent);

    // Render all sections
    renderClasificacion();
    renderGoleadores();
    renderMVP();
    renderResultados();
  } catch (error) {
    console.error('Error loading inline data:', error);
    showError('No se pudo cargar la información de la liga. Verifica que el bloque de datos JSON embebido es correcto.');
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

      return `
        <div class="match-card ${matchClass}">
          <div class="team home ${homeClass}">
            ${homeTeam ? homeTeam.name : 'N/A'}
          </div>
          <div class="score">
            <span>${match.homeScore}</span>
            <span class="score-separator">-</span>
            <span>${match.awayScore}</span>
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
  const sections = ['clasificacion', 'goleadores', 'mvp', 'resultados'];
  sections.forEach(section => {
    const element = document.getElementById(
      section === 'clasificacion' ? 'tbody-clasificacion' :
        section === 'resultados' ? 'container-resultados' :
          `list-${section}`
    );
    if (element) {
      element.innerHTML = `<div class="error">${message}</div>`;
    }
  });
}
