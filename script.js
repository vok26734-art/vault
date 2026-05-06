const SITE_PASSWORD = "1234"; 

const gamesList = [
    { title: "Doodle Jump", img: "https://via.placeholder.com/200x120", url: "https://example.com/1", category: "action" },
    { title: "Retro Space", img: "https://via.placeholder.com/200x120", url: "https://example.com/2", category: "retro" },
    { title: "City Racer", img: "https://via.placeholder.com/200x120", url: "https://example.com/3", category: "action" }
];

let currentGameTitle = "";

window.onload = () => {
    checkLogin();
    displayGames(gamesList);
    displayRecent();
    updateLeaderboard();
};

function checkLogin() {
    const user = localStorage.getItem('vaultUser');
    const auth = localStorage.getItem('vaultAuth');
    const modal = document.getElementById('loginModal');
    const userSection = document.getElementById('userSection');

    if (auth !== SITE_PASSWORD) {
        const entry = prompt("This site is private. Enter Password:");
        if (entry === SITE_PASSWORD) {
            localStorage.setItem('vaultAuth', SITE_PASSWORD);
        } else {
            document.body.innerHTML = "<h1 style='color:white; text-align:center;'>Access Denied</h1>";
            return;
        }
    }

    if (!user) {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
        userSection.innerHTML = `
            <span>${user}</span>
            <div class="user-avatar">${user[0].toUpperCase()}</div>
            <button onclick="logout()" style="margin-left:10px; background:red; color:white; border:none; padding:5px; border-radius:5px; cursor:pointer;">Logout</button>
        `;
    }
}

function saveProfile() {
    const name = document.getElementById('usernameInput').value;
    if (name.trim() !== "") {
        localStorage.setItem('vaultUser', name);
        checkLogin();
    }
}

function logout() {
    localStorage.clear(); // Clears everything
    location.reload();
}

// SCORE SYSTEM
function submitScore() {
    const score = document.getElementById('manualScore').value;
    if (score && currentGameTitle) {
        let scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
        // Only save if it's a new personal high score
        if (!scores[currentGameTitle] || parseInt(score) > parseInt(scores[currentGameTitle])) {
            scores[currentGameTitle] = score;
            localStorage.setItem('vaultScores', JSON.stringify(scores));
            alert("New High Score!");
        }
        updateLeaderboard();
        document.getElementById('manualScore').value = "";
    }
}

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('vaultScores')) || {};
    const body = document.getElementById('leaderboardBody');
    body.innerHTML = "";
    for (const [game, score] of Object.entries(scores)) {
        body.innerHTML += `<tr><td>${game}</td><td>${score}</td></tr>`;
    }
}

// GAME SYSTEM
function displayGames(games) {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = ''; 
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<img src="${game.img}"><h3>${game.title}</h3>`;
        card.onclick = () => loadGame(game);
        grid.appendChild(card);
    });
}

function loadGame(game) {
    currentGameTitle = game.title;
    let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    recent = [game, ...recent.filter(g => g.title !== game.title)].slice(0, 4);
    localStorage.setItem('recentGames', JSON.stringify(recent));

    document.getElementById('gameFrame').src = game.url;
    document.getElementById('gamePlayerContainer').style.display = 'block';
    document.getElementById('gameLibrary').style.display = 'none';
    document.getElementById('recentGames').style.display = 'none';
    document.getElementById('leaderboardSection').style.display = 'none';
    displayRecent();
}

function closeGame() {
    document.getElementById('gameFrame').src = "";
    document.getElementById('gamePlayerContainer').style.display = 'none';
    document.getElementById('gameLibrary').style.display = 'block';
    document.getElementById('recentGames').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'block';
}

function displayRecent() {
    const recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    const recentList = document.getElementById('recentList');
    recentList.innerHTML = '';
    recent.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `<img src="${game.img}"><h3>${game.title}</h3>`;
        card.onclick = () => loadGame(game);
        recentList.appendChild(card);
    });
}

function filterCategory(cat) {
    const filtered = cat === 'all' ? gamesList : gamesList.filter(g => g.category === cat);
    displayGames(filtered);
}
