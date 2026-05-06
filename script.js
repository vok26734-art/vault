const SITE_PASSWORD = "1234"; 

const gamesList = [
    { title: "Doodle Jump", img: "https://via.placeholder.com/400x250/111/00d2ff?text=Doodle+Jump", url: "https://example.com/1", category: "action" },
    { title: "Retro Space", img: "https://via.placeholder.com/400x250/111/00d2ff?text=Retro+Space", url: "https://example.com/2", category: "retro" },
    { title: "City Racer", img: "https://via.placeholder.com/400x250/111/00d2ff?text=City+Racer", url: "https://example.com/3", category: "action" }
];

const badges = [
    { id: 'first_play', name: 'Rookie', icon: '🎮' },
    { id: 'high_score', name: 'Pro', icon: '🏆' },
    { id: 'collector', name: 'Collector', icon: '📦' }
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

function showLoader(callback) {
    const loader = document.getElementById('loadingOverlay');
    loader.style.display = 'flex';
    setTimeout(() => {
        loader.style.display = 'none';
        if (callback) callback();
    }, 800); // 0.8 seconds fake loading
}

function checkLogin() {
    const user = localStorage.getItem('vaultUser');
    const auth = localStorage.getItem('vaultAuth');
    if (auth !== SITE_PASSWORD) {
        const entry = prompt("Private Access: Enter Password");
        if (entry === SITE_PASSWORD) localStorage.setItem('vaultAuth', SITE_PASSWORD);
        else { document.body.innerHTML = "<h1>Blocked</h1>"; return; }
    }
    const modal = document.getElementById('loginModal');
    if (!user) modal.style.display = 'flex';
    else {
        modal.style.display = 'none';
        document.getElementById('userSection').innerHTML = `
            <span style="color:var(--primary); font-size:12px; margin-right:10px;">LVL 1</span>
            <strong>${user}</strong>
            <button onclick="logout()" style="margin-left:15px; background:none; border:none; color:#555; cursor:pointer;">Exit</button>
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
    document.getElementById('badgeList').innerHTML = badges.map(b => `
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
    }
}

function loadGame(game) {
    showLoader(() => {
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
    });
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
        alert("Score Synced!");
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
    const list = document.getElementById('recentList');
    if(recent.length === 0) list.innerHTML = "<p style='color:#444; margin-left:5%'>No history yet.</p>";
    else list.innerHTML = recent.map(g => `
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
