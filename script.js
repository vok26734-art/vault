const SITE_PASSWORD = "1234"; 

const gamesList = [
    { title: "Doodle Jump", img: "https://via.placeholder.com/400x250/111/00d2ff?text=Doodle+Jump", url: "https://example.com/1", category: "action" },
    { title: "Retro Space", img: "https://via.placeholder.com/400x250/111/00d2ff?text=Retro+Space", url: "https://example.com/2", category: "retro" },
    { title: "City Racer", img: "https://via.placeholder.com/400x250/111/00d2ff?text=City+Racer", url: "https://example.com/3", category: "action" }
];

const badges = [
    { id: 'first_play', name: 'Rookie', icon: '🎮', hint: 'Play your first game' },
    { id: 'high_score', name: 'Pro', icon: '🏆', hint: 'Submit any high score' },
    { id: 'collector', name: 'Collector', icon: '📦', hint: 'Play 3 different games' }
];

let currentGame = null;

window.onload = () => {
    checkLogin();
    setupHero();
    displayGames(gamesList);
    displayRecent();
    updateLeaderboard();
    renderBadges();
};

function checkLogin() {
    const user = localStorage.getItem('vaultUser');
    const auth = localStorage.getItem('vaultAuth');
    if (auth !== SITE_PASSWORD) {
        const entry = prompt("Enter Vault Password:");
        if (entry === SITE_PASSWORD) localStorage.setItem('vaultAuth', SITE_PASSWORD);
        else { document.body.innerHTML = "<h1>Locked</h1>"; return; }
    }

    const modal = document.getElementById('loginModal');
    if (!user) modal.style.display = 'flex';
    else {
        modal.style.display = 'none';
        document.getElementById('userSection').innerHTML = `
            <div class="user-info">
                <span class="level-tag">LVL 1</span>
                <strong>${user}</strong>
            </div>
            <div class="user-avatar" style="background:var(--primary); width:35px; height:35px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-weight:bold;">${user[0].toUpperCase()}</div>
            <button onclick="logout()" style="background:none; border:none; color:#444; cursor:pointer;">Exit</button>
        `;
    }
}

function saveProfile() {
    const n = document.getElementById('usernameInput').value;
    if (n.trim()) { localStorage.setItem('vaultUser', n); checkLogin(); }
}

function logout() { localStorage.clear(); location.reload(); }

function renderBadges() {
    const unlocked = JSON.parse(localStorage.getItem('vaultBadges')) || [];
    const container = document.getElementById('badgeList');
    container.innerHTML = badges.map(b => `
        <div class="badge-item ${unlocked.includes(b.id) ? 'unlocked' : ''}">
            <div class="badge-icon">${b.icon}</div>
            <small>${b.name}</small>
        </div>
    `).join('');
}

function unlockBadge(id) {
    let unlocked = JSON.parse(localStorage.getItem('vaultBadges')) || [];
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('vaultBadges', JSON.stringify(unlocked));
        renderBadges();
        alert("🎖️ New Badge Unlocked: " + badges.find(b => b.id === id).name);
    }
}

function loadGame(game) {
    currentGame = game;
    unlockBadge('first_play');
    
    let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    recent = [game, ...recent.filter(g => g.title !== game.title)].slice(0, 4);
    localStorage.setItem('recentGames', JSON.stringify(recent));
    
    if (recent.length >= 3) unlockBadge('collector');

    document.getElementById('gameFrame').src = game.url;
    document.getElementById('gamePlayerContainer').style.display = 'block';
    document.querySelectorAll('.shelf, .hero-section').forEach(s => s.style.display = 'none');
    displayRecent();
}

function closeGame() {
    document.getElementById('gameFrame').src = "";
    document.getElementById('gamePlayerContainer').style.display = 'none';
    document.querySelectorAll('.shelf, .hero-section').forEach(s => s.style.display = 'block');
}

function submitScore() {
    const val = document.getElementById('manualScore').value;
    if (val && currentGame) {
        unlockBadge('high_score');
        let scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
        if (!scores[currentGame.title] || parseInt(val) > parseInt(scores[currentGame.title])) {
            scores[currentGame.title] = val;
            localStorage.setItem('vaultScores', JSON.stringify(scores));
        }
        updateLeaderboard();
        alert("High Score Recorded!");
    }
}

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
    document.getElementById('leaderboardBody').innerHTML = Object.entries(scores).map(([g, s]) => 
        `<tr><td>${g}</td><td>${s} PTS</td></tr>`
    ).join('');
}

function setupHero() {
    document.getElementById('featuredTitle').innerText = gamesList[0].title;
    document.getElementById('featuredPlayBtn').onclick = () => loadGame(gamesList[0]);
}

function displayGames(list) {
    document.getElementById('gameGrid').innerHTML = list.map(g => `
        <div class="game-card" onclick='loadGame(${JSON.stringify(g)})'>
            <img src="${g.img}">
            <h3>${g.title}</h3>
        </div>
    `).join('');
}

function displayRecent() {
    const recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    document.getElementById('recentList').innerHTML = recent.map(g => `
        <div class="game-card" onclick='loadGame(${JSON.stringify(g)})'>
            <img src="${g.img}">
            <h3>${g.title}</h3>
        </div>
    `).join('');
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    const filtered = cat === 'all' ? gamesList : gamesList.filter(g => g.category === cat);
    displayGames(filtered);
}
