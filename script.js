const SITE_PASSWORD = "1234"; 
const badges = [
    { id: 'first_play', name: 'Recruit', icon: '🎖️' },
    { id: 'high_score', name: 'Elite', icon: '👑' },
    { id: 'fav_badge', name: 'Loyal', icon: '❤️' }
];

let gamesList = [];
let currentGame = null;

window.onload = async () => {
    checkLogin();
    startClock();
    updateXPBar();
    renderBadges();

    // Fetch the Master Database
    try {
        const response = await fetch('data/games.json');
        gamesList = await response.json();
        
        setupHero();
        displayGames(gamesList);
        displayRecent();
        updateLeaderboard();
    } catch (err) {
        console.error("Data fetch failed:", err);
        logStatus("SYSTEM ERROR: JSON NOT FOUND");
    }
};

// --- SYSTEM CORE ---
function startClock() {
    setInterval(() => {
        const timeEl = document.getElementById('currentTime');
        if(timeEl) timeEl.innerText = new Date().toLocaleTimeString();
    }, 1000);
}

function logStatus(msg) {
    const statusEl = document.getElementById('systemStatus');
    if(statusEl) {
        statusEl.innerText = msg;
        setTimeout(() => statusEl.innerText = "System Online", 3000);
    }
}

function addXP(amount) {
    let xp = parseInt(localStorage.getItem('vaultXP')) || 0;
    let lvl = parseInt(localStorage.getItem('vaultLvl')) || 1;
    xp += amount;
    if (xp >= 100) { 
        xp = 0; 
        lvl += 1; 
        localStorage.setItem('vaultLvl', lvl); 
        logStatus("LVL UP!"); 
        alert("Level " + lvl + " reached!"); 
    }
    localStorage.setItem('vaultXP', xp);
    updateXPBar();
}

function updateXPBar() {
    const xp = parseInt(localStorage.getItem('vaultXP')) || 0;
    const lvl = parseInt(localStorage.getItem('vaultLvl')) || 1;
    const user = localStorage.getItem('vaultUser');
    const userSec = document.getElementById('userSection');
    if (user && userSec) {
        userSec.innerHTML = `
            <div class="xp-container">
                <div class="xp-label">LVL ${lvl} - ${xp}%</div>
                <div class="xp-bar-bg"><div class="xp-bar-fill" style="width: ${xp}%"></div></div>
            </div>
            <div style="text-align:right"><strong>${user}</strong></div>
            <div style="width:35px; height:35px; background:var(--primary); color:#000; border-radius:5px; display:flex; align-items:center; justify-content:center; margin-left:15px; font-weight:900;">${user[0].toUpperCase()}</div>
        `;
    }
}

// --- AUTH & PROFILE ---
function checkLogin() {
    const auth = localStorage.getItem('vaultAuth');
    const user = localStorage.getItem('vaultUser');
    if (auth !== SITE_PASSWORD) {
        const entry = prompt("Enter Access Key:");
        if (entry === SITE_PASSWORD) localStorage.setItem('vaultAuth', SITE_PASSWORD);
        else { document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:20%'>ACCESS DENIED</h1>"; return; }
    }
    const modal = document.getElementById('loginModal');
    if (!user && modal) modal.style.display = 'flex';
    else if(modal) modal.style.display = 'none';
}

function saveProfile() {
    const n = document.getElementById('usernameInput').value;
    if (n.trim()) { 
        localStorage.setItem('vaultUser', n); 
        localStorage.setItem('vaultLvl', 1); 
        localStorage.setItem('vaultXP', 0); 
        checkLogin(); 
        updateXPBar();
    }
}

// --- GAME ENGINE ---
function loadGame(game) {
    const loader = document.getElementById('loadingOverlay');
    if(loader) {
        document.getElementById('loaderText').innerText = "Initializing " + game.title + "...";
        loader.style.display = 'flex';
    }
    
    setTimeout(() => {
        addXP(15);
        unlockBadge('first_play');
        
        // Save to Recent
        let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
        recent = [game, ...recent.filter(g => g.id !== game.id)].slice(0, 8);
        localStorage.setItem('recentGames', JSON.stringify(recent));
        
        // Redirect to the dedicated Player Page
        window.location.href = `play.html?id=${game.id}`;
    }, 1000);
}

function displayGames(list) {
    const favs = JSON.parse(localStorage.getItem('vaultFavs')) || [];
    const grid = document.getElementById('gameGrid');
    if(!grid) return;

    grid.innerHTML = list.map(g => `
        <div class="game-card" onclick='loadGame(${JSON.stringify(g)})' oncontextmenu="event.preventDefault(); toggleFav('${g.id}')">
            <div class="fav-icon" style="color:${favs.includes(g.id) ? 'red' : 'rgba(255,255,255,0.2)'}">❤️</div>
            <img src="${g.img}" alt="${g.title}" loading="lazy">
            <h3>${g.title}</h3>
        </div>
    `).join('');
}

function toggleFav(id) {
    let favs = JSON.parse(localStorage.getItem('vaultFavs')) || [];
    if (favs.includes(id)) {
        favs = favs.filter(t => t !== id);
    } else {
        favs.push(id);
        unlockBadge('fav_badge');
    }
    localStorage.setItem('vaultFavs', JSON.stringify(favs));
    displayGames(gamesList);
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if(event) event.target.classList.add('active');
    
    if (cat === 'favs') {
        const favIds = JSON.parse(localStorage.getItem('vaultFavs')) || [];
        displayGames(gamesList.filter(g => favIds.includes(g.id)));
    } else {
        displayGames(cat === 'all' ? gamesList : gamesList.filter(g => g.category === cat));
    }
}

// --- SOCIAL & UI ---
function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
    const body = document.getElementById('leaderboardBody');
    if(body) {
        body.innerHTML = Object.entries(scores).map(([g, s]) => 
            `<tr><td>${g}</td><td>${s}</td></tr>`
        ).join('');
    }
}

function renderBadges() {
    const unlocked = JSON.parse(localStorage.getItem('vaultBadges')) || [];
    const list = document.getElementById('badgeList');
    if(list) {
        list.innerHTML = badges.map(b => `
            <div style="text-align:center; opacity:${unlocked.includes(b.id)?'1':'0.1'}; transition:0.5s">
                <div style="font-size:30px; background:#1a1a1a; width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 5px; border:1px solid #333">${b.icon}</div>
                <small style="font-size:10px; color:var(--primary)">${b.name.toUpperCase()}</small>
            </div>
        `).join('');
    }
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
    if(gamesList.length === 0) return;
    const featured = gamesList[Math.floor(Math.random() * gamesList.length)];
    const titleEl = document.getElementById('featuredTitle');
    const btnEl = document.getElementById('featuredPlayBtn');
    if(titleEl) titleEl.innerText = featured.title;
    if(btnEl) btnEl.onclick = () => loadGame(featured);
}

function displayRecent() {
    const recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    const list = document.getElementById('recentList');
    if(list) {
        list.innerHTML = recent.map(g => `
            <div class="game-card" onclick='loadGame(${JSON.stringify(g)})'>
                <img src="${g.img}">
                <h3>${g.title}</h3>
            </div>
        `).join('');
    }
}

const search = document.getElementById('searchBar');
if(search) {
    search.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        displayGames(gamesList.filter(g => g.title.toLowerCase().includes(term)));
    };
}
