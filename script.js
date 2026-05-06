const SITE_PASSWORD = "1234"; 

const gamesList = [
    { title: "2048", img: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80", url: "https://play2048.co/", category: "action" },
    { title: "Hextris", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80", url: "https://hextris.io/", category: "retro" },
    { title: "Chrome Dino", img: "https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?auto=format&fit=crop&w=400&q=80", url: "https://chromedino.com/", category: "retro" },
    { title: "Tetris Lite", img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=400&q=80", url: "https://tetris.com/play-tetris", category: "retro" }
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

// --- LEVEL & XP SYSTEM ---
function addXP(amount) {
    let xp = parseInt(localStorage.getItem('vaultXP')) || 0;
    let lvl = parseInt(localStorage.getItem('vaultLvl')) || 1;
    
    xp += amount;
    if (xp >= 100) {
        xp = 0;
        lvl += 1;
        localStorage.setItem('vaultLvl', lvl);
        logStatus("LEVEL UP! NOW LEVEL " + lvl);
        alert("🎉 LEVEL UP! You are now Level " + lvl);
    }
    localStorage.setItem('vaultXP', xp);
    updateXPBar();
}

function updateXPBar() {
    const xp = parseInt(localStorage.getItem('vaultXP')) || 0;
    const lvl = parseInt(localStorage.getItem('vaultLvl')) || 1;
    const user = localStorage.getItem('vaultUser');
    
    if (user) {
        const userSection = document.getElementById('userSection');
        userSection.innerHTML = `
            <div class="xp-container">
                <div class="xp-label">LEVEL ${lvl} - ${xp}% XP</div>
                <div class="xp-bar-bg"><div class="xp-bar-fill" style="width: ${xp}%"></div></div>
            </div>
            <div style="text-align:right"><strong>${user}</strong></div>
            <div style="width:35px; height:35px; background:var(--primary); color:#000; border-radius:5px; display:flex; align-items:center; justify-content:center; margin-left:15px; font-weight:900;">${user[0].toUpperCase()}</div>
        `;
    }
}

// --- LOGIN & PROFILE ---
function checkLogin() {
    const auth = localStorage.getItem('vaultAuth');
    const user = localStorage.getItem('vaultUser');
    
    if (auth !== SITE_PASSWORD) {
        const entry = prompt("SECURITY CHECK: Enter Password");
        if (entry === SITE_PASSWORD) localStorage.setItem('vaultAuth', SITE_PASSWORD);
        else { document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:20%'>ACCESS DENIED</h1>"; return; }
    }

    if (!user) document.getElementById('loginModal').style.display = 'flex';
    else {
        document.getElementById('loginModal').style.display = 'none';
        updateXPBar();
    }
}

function saveProfile() {
    const n = document.getElementById('usernameInput').value;
    if (n.trim()) {
        localStorage.setItem('vaultUser', n);
        localStorage.setItem('vaultLvl', 1);
        localStorage.setItem('vaultXP', 0);
        checkLogin();
    }
}

function logout() { localStorage.clear(); location.reload(); }

// --- GAME LOGIC ---
function loadGame(game) {
    const loader = document.getElementById('loadingOverlay');
    const loaderText = document.getElementById('loaderText');
    loaderText.innerText = "Fetching " + game.title + "...";
    loader.style.display = 'flex';

    setTimeout(() => {
        loader.style.display = 'none';
        currentGame = game;
        addXP(20); // Reward for playing
        unlockBadge('first_play');
        
        let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
        recent = [game, ...recent.filter(g => g.title !== game.title)].slice(0, 5);
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

function submitScore() {
    const val = document.getElementById('manualScore').value;
    if (val && currentGame) {
        addXP(50); // Big reward for high scores
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

// --- UI UPDATES ---
function displayGames(list) {
    const favs = JSON.parse(localStorage.getItem('vaultFavs')) || [];
    document.getElementById('gameGrid').innerHTML = list.map(g => {
        const isFav = favs.includes(g.title);
        return `
            <div class="game-card" onclick='loadGame(${JSON.stringify(g)})' oncontextmenu="event.preventDefault(); toggleFav('${g.title}')">
                <div style="position:absolute; right:10px; top:10px; color:${isFav ? 'red' : '#333'}">❤️</div>
                <img src="${g.img}">
                <h3>${g.title}</h3>
            </div>
        `;
    }).join('');
}

function toggleFav(title) {
    let favs = JSON.parse(localStorage.getItem('vaultFavs')) || [];
    if (favs.includes(title)) favs = favs.filter(t => t !== title);
    else { favs.push(title); unlockBadge('fav_badge'); addXP(10); }
    localStorage.setItem('vaultFavs', JSON.stringify(favs));
    displayGames(gamesList);
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    if (cat === 'favs') {
        const favNames = JSON.parse(localStorage.getItem('vaultFavs')) || [];
        displayGames(gamesList.filter(g => favNames.includes(g.title)));
    } else {
        displayGames(cat === 'all' ? gamesList : gamesList.filter(g => g.category === cat));
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
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('vaultBadges', JSON.stringify(unlocked));
        renderBadges();
        addXP(30);
    }
}

function setupHero() {
    document.getElementById('featuredTitle').innerText = gamesList[0].title;
    document.getElementById('featuredPlayBtn').onclick = () => loadGame(gamesList[0]);
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
