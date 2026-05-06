const SITE_PASSWORD = "1234"; 

// --- THE MASTER GAME DATABASE ---
const gamesList = [
    { title: "Survival Race", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400", url: "https://sites.google.com/classroom.center/view-1/survival-race/race-fullscreen", category: "action" },
    { title: "Doblox 2", img: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400", url: "https://sites.google.com/classroom.center/view-1/doblox-2", category: "action" },
    { title: "Real Kart", img: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=400", url: "https://sites.google.com/classroom.center/view-1/real-kart", category: "action" },
    { title: "Granny", img: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400", url: "https://sites.google.com/classroom.center/view-1/granny", category: "action" },
    { title: "Jetpack", img: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400", url: "https://sites.google.com/classroom.center/view-1/jetpack", category: "action" },
    { title: "2048", img: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400", url: "https://play2048.co/", category: "action" },
    { title: "Pac-Man", img: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400", url: "https://pacman.live/play.html", category: "retro" },
    { title: "Hextris", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400", url: "https://hextris.io/", category: "action" },
    { title: "Tetris", img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400", url: "https://tetris.com/play-tetris", category: "retro" }
];

const badges = [
    { id: 'first_play', name: 'Recruit', icon: '🎖️' },
    { id: 'high_score', name: 'Elite', icon: '👑' },
    { id: 'fav_badge', name: 'Loyal', icon: '❤️' }
];

let currentGame = null;

window.onload = () => {
    checkLogin();
    setupHero();
    displayGames(gamesList);
    displayRecent();
    updateLeaderboard();
    renderBadges();
    startClock();
    updateXPBar();
};

// --- SYSTEM UTILS ---
function startClock() {
    setInterval(() => {
        document.getElementById('currentTime').innerText = new Date().toLocaleTimeString();
    }, 1000);
}

function logStatus(msg) {
    document.getElementById('systemStatus').innerText = msg;
    setTimeout(() => document.getElementById('systemStatus').innerText = "System Online", 3000);
}

function addXP(amount) {
    let xp = parseInt(localStorage.getItem('vaultXP')) || 0;
    let lvl = parseInt(localStorage.getItem('vaultLvl')) || 1;
    xp += amount;
    if (xp >= 100) { xp = 0; lvl += 1; localStorage.setItem('vaultLvl', lvl); logStatus("LVL UP!"); alert("Level " + lvl + " reached!"); }
    localStorage.setItem('vaultXP', xp);
    updateXPBar();
}

function updateXPBar() {
    const xp = parseInt(localStorage.getItem('vaultXP')) || 0;
    const lvl = parseInt(localStorage.getItem('vaultLvl')) || 1;
    const user = localStorage.getItem('vaultUser');
    if (user) {
        document.getElementById('userSection').innerHTML = `
            <div class="xp-container">
                <div class="xp-label">LVL ${lvl} - ${xp}%</div>
                <div class="xp-bar-bg"><div class="xp-bar-fill" style="width: ${xp}%"></div></div>
            </div>
            <div style="text-align:right"><strong>${user}</strong></div>
            <div style="width:35px; height:35px; background:var(--primary); color:#000; border-radius:5px; display:flex; align-items:center; justify-content:center; margin-left:15px; font-weight:900;">${user[0].toUpperCase()}</div>
        `;
    }
}

function checkLogin() {
    const auth = localStorage.getItem('vaultAuth');
    const user = localStorage.getItem('vaultUser');
    if (auth !== SITE_PASSWORD) {
        const entry = prompt("Enter Password:");
        if (entry === SITE_PASSWORD) localStorage.setItem('vaultAuth', SITE_PASSWORD);
        else { document.body.innerHTML = "<h1>Blocked</h1>"; return; }
    }
    if (!user) document.getElementById('loginModal').style.display = 'flex';
    else { document.getElementById('loginModal').style.display = 'none'; updateXPBar(); }
}

function saveProfile() {
    const n = document.getElementById('usernameInput').value;
    if (n.trim()) { localStorage.setItem('vaultUser', n); localStorage.setItem('vaultLvl', 1); localStorage.setItem('vaultXP', 0); checkLogin(); }
}

function logout() { localStorage.clear(); location.reload(); }

function loadGame(game) {
    const loader = document.getElementById('loadingOverlay');
    document.getElementById('loaderText').innerText = "Fetching " + game.title + "...";
    loader.style.display = 'flex';
    setTimeout(() => {
        loader.style.display = 'none';
        currentGame = game;
        addXP(20);
        unlockBadge('first_play');
        let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
        recent = [game, ...recent.filter(g => g.title !== game.title)].slice(0, 8);
        localStorage.setItem('recentGames', JSON.stringify(recent));
        document.getElementById('gameFrame').src = game.url;
        document.getElementById('gamePlayerContainer').style.display = 'block';
        document.querySelectorAll('.shelf, .hero-section').forEach(s => s.style.display = 'none');
        displayRecent();
    }, 1200);
}

function closeGame() {
    document.getElementById('gameFrame').src = "";
    document.getElementById('gamePlayerContainer').style.display = 'none';
    document.querySelectorAll('.shelf, .hero-section').forEach(s => s.style.display = 'block');
}

function displayGames(list) {
    const favs = JSON.parse(localStorage.getItem('vaultFavs')) || [];
    document.getElementById('gameGrid').innerHTML = list.map(g => `
        <div class="game-card" onclick='loadGame(${JSON.stringify(g)})' oncontextmenu="event.preventDefault(); toggleFav('${g.title}')">
            <div style="position:absolute; right:10px; top:10px; color:${favs.includes(g.title) ? 'red' : '#333'}">❤️</div>
            <img src="${g.img}">
            <h3>${g.title}</h3>
        </div>
    `).join('');
}

function toggleFav(title) {
    let favs = JSON.parse(localStorage.getItem('vaultFavs')) || [];
    if (favs.includes(title)) favs = favs.filter(t => t !== title);
    else { favs.push(title); unlockBadge('fav_badge'); }
    localStorage.setItem('vaultFavs', JSON.stringify(favs));
    displayGames(gamesList);
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');
    if (cat === 'favs') {
        const favNames = JSON.parse(localStorage.getItem('vaultFavs')) || [];
        displayGames(gamesList.filter(g => favNames.includes(g.title)));
    } else {
        displayGames(cat === 'all' ? gamesList : gamesList.filter(g => g.category === cat));
    }
}

function submitScore() {
    const val = document.getElementById('manualScore').value;
    if (val && currentGame) {
        addXP(50);
        unlockBadge('high_score');
        let scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
        if (!scores[currentGame.title] || parseInt(val) > parseInt(scores[currentGame.title])) {
            scores[currentGame.title] = val;
            localStorage.setItem('vaultScores', JSON.stringify(scores));
        }
        updateLeaderboard();
        logStatus("DATA SYNCED");
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
        <div style="text-align:center; opacity:${unlocked.includes(b.id)?'1':'0.1'}; transition:0.5s">
            <div style="font-size:30px; background:#1a1a1a; width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 5px; border:1px solid #333">${b.icon}</div>
            <small style="font-size:10px; color:var(--primary)">${b.name.toUpperCase()}</small>
        </div>
    `).join('');
}

function unlockBadge(id) {
    let unlocked = JSON.parse(localStorage.getItem('vaultBadges')) || [];
    if (!unlocked.includes(id)) { unlocked.push(id); localStorage.setItem('vaultBadges', JSON.stringify(unlocked)); renderBadges(); }
}

function setupHero() {
    const featured = gamesList[Math.floor(Math.random() * gamesList.length)];
    document.getElementById('featuredTitle').innerText = featured.title;
    document.getElementById('featuredPlayBtn').onclick = () => loadGame(featured);
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

document.getElementById('searchBar').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    displayGames(gamesList.filter(g => g.title.toLowerCase().includes(term)));
};
