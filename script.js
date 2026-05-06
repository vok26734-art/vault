const SITE_PASSWORD = "1234"; 

const gamesList = [
    { title: "Doodle Jump", img: "https://via.placeholder.com/400x250/111/007bff?text=Doodle+Jump", url: "https://example.com/1", category: "action" },
    { title: "Retro Space", img: "https://via.placeholder.com/400x250/111/007bff?text=Retro+Space", url: "https://example.com/2", category: "retro" },
    { title: "City Racer", img: "https://via.placeholder.com/400x250/111/007bff?text=City+Racer", url: "https://example.com/3", category: "action" }
];

let currentGame = null;

window.onload = () => {
    checkLogin();
    setupHero();
    displayGames(gamesList);
    displayRecent();
    updateLeaderboard();
};

function setupHero() {
    const featured = gamesList[0];
    document.getElementById('featuredTitle').innerText = featured.title;
    document.getElementById('featuredPlayBtn').onclick = () => loadGame(featured);
}

function checkLogin() {
    const user = localStorage.getItem('vaultUser');
    const auth = localStorage.getItem('vaultAuth');
    const modal = document.getElementById('loginModal');
    const userSection = document.getElementById('userSection');

    if (auth !== SITE_PASSWORD) {
        const entry = prompt("Private Access Required. Password:");
        if (entry === SITE_PASSWORD) {
            localStorage.setItem('vaultAuth', SITE_PASSWORD);
        } else {
            document.body.innerHTML = "<h1>Unauthorized</h1>";
            return;
        }
    }

    if (!user) {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
        userSection.innerHTML = `
            <div class="user-avatar">${user[0].toUpperCase()}</div>
            <span style="margin-left:10px">${user}</span>
            <button onclick="logout()" style="margin-left:15px; background:none; border:none; color:#666; cursor:pointer;">Logout</button>
        `;
    }
}

function saveProfile() {
    const name = document.getElementById('usernameInput').value;
    if (name.trim()) {
        localStorage.setItem('vaultUser', name);
        checkLogin();
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

function loadGame(game) {
    currentGame = game;
    // Update Recent
    let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    recent = [game, ...recent.filter(g => g.title !== game.title)].slice(0, 4);
    localStorage.setItem('recentGames', JSON.stringify(recent));

    document.getElementById('gameFrame').src = game.url;
    document.getElementById('gamePlayerContainer').style.display = 'block';
    document.getElementById('featuredSection').style.display = 'none';
    document.getElementById('gameLibrary').style.display = 'none';
    document.getElementById('recentGames').style.display = 'none';
    document.getElementById('leaderboardSection').style.display = 'none';
    displayRecent();
}

function closeGame() {
    document.getElementById('gameFrame').src = "";
    document.getElementById('gamePlayerContainer').style.display = 'none';
    document.getElementById('featuredSection').style.display = 'flex';
    document.getElementById('gameLibrary').style.display = 'block';
    document.getElementById('recentGames').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'block';
}

function submitScore() {
    const val = document.getElementById('manualScore').value;
    if (val && currentGame) {
        let scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
        if (!scores[currentGame.title] || parseInt(val) > parseInt(scores[currentGame.title])) {
            scores[currentGame.title] = val;
            localStorage.setItem('vaultScores', JSON.stringify(scores));
        }
        updateLeaderboard();
        alert("Score Saved!");
    }
}

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
    const body = document.getElementById('leaderboardBody');
    body.innerHTML = Object.entries(scores).map(([game, sc]) => 
        `<tr><td>${game}</td><td>${sc}</td></tr>`
    ).join('');
}

function displayGames(list) {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = list.map(game => `
        <div class="game-card" onclick='loadGame(${JSON.stringify(game)})'>
            <img src="${game.img}">
            <h3>${game.title}</h3>
        </div>
    `).join('');
}

function displayRecent() {
    const recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    const list = document.getElementById('recentList');
    list.innerHTML = recent.map(game => `
        <div class="game-card" onclick='loadGame(${JSON.stringify(game)})'>
            <img src="${game.img}">
            <h3>${game.title}</h3>
        </div>
    `).join('');
}

function filterCategory(cat) {
    const btns = document.querySelectorAll('.cat-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    const filtered = cat === 'all' ? gamesList : gamesList.filter(g => g.category === cat);
    displayGames(filtered);
}
