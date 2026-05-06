const SITE_PASSWORD = "1234"; 

const gamesList = [
    { title: "2048", img: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80", url: "https://play2048.co/", category: "action" },
    { title: "Hextris", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80", url: "https://hextris.io/", category: "retro" },
    { title: "Chrome Dino", img: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?auto=format&fit=crop&w=400&q=80", url: "https://chromedino.com/", category: "retro" }
];

const badges = [
    { id: 'first_play', name: 'Recruit', icon: '🎖️' },
    { id: 'high_score', name: 'Elite', icon: '👑' },
    { id: 'collector', name: 'Hoarder', icon: '💎' }
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
    }, 1000);
}

function checkLogin() {
    const auth = localStorage.getItem('vaultAuth');
    const user = localStorage.getItem('vaultUser');
    
    if (auth !== SITE_PASSWORD) {
        const entry = prompt("Enter Vault Password:");
        if (entry === SITE_PASSWORD) localStorage.setItem('vaultAuth', SITE_PASSWORD);
        else { document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:20%'>ACCESS DENIED</h1>"; return; }
    }

    if (!user) document.getElementById('loginModal').style.display = 'flex';
    else {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('userSection').innerHTML = `
            <div style="text-align:right">
                <div style="font-size:12px; color:var(--primary)">OPERATIVE</div>
                <strong>${user}</strong>
            </div>
            <button onclick="logout()" style="background:none;border:none;color:#555;cursor:pointer;margin-left:15px">LOGOUT</button>
        `;
    }
}

function saveProfile() {
    const n = document.getElementById('usernameInput').value;
    if (n.trim()) { localStorage.setItem('vaultUser', n); checkLogin(); }
}

function logout() { localStorage.clear(); location.reload(); }

function loadGame(game) {
    showLoader(() => {
        currentGame = game;
        unlockBadge('first_play');
        let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
        recent = [game, ...recent.filter(g => g.title !== game.title)].slice(0, 5);
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
        alert("Record Updated!");
    }
}

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
    document.getElementById('leaderboardBody').innerHTML = Object.entries(scores).map(([g, s]) => 
        `<tr><td>${g}</td><td>${s}</td></tr>`
    ).join('');
}

function renderBadges() {
    const unlocked = JSON.parse(localStorage.getItem('vaultBadges')) || [];
    document.getElementById('badgeList').innerHTML = badges.map(b => `
        <div class="badge-item ${unlocked.includes(b.id) ? 'unlocked' : ''}" style="text-align:center; opacity:${unlocked.includes(b.id)?'1':'0.2'}">
            <div style="font-size:30px">${b.icon}</div>
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
