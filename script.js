const gamesList = [
    { title: "Doodle Jump", img: "https://via.placeholder.com/200x120", url: "https://example.com/1", category: "action" },
    { title: "Retro Space", img: "https://via.placeholder.com/200x120", url: "https://example.com/2", category: "retro" },
    { title: "City Racer", img: "https://via.placeholder.com/200x120", url: "https://example.com/3", category: "action" }
];

window.onload = () => {
    checkLogin();
    displayGames(gamesList);
    displayRecent();
};

// USER SYSTEM
function checkLogin() {
    const user = localStorage.getItem('vaultUser');
    const modal = document.getElementById('loginModal');
    const userSection = document.getElementById('userSection');

    if (!user) {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
        userSection.innerHTML = `
            <span>${user}</span>
            <div class="user-avatar">${user[0].toUpperCase()}</div>
            <button onclick="logout()" style="font-size:10px; background:none; color:red; border:none; cursor:pointer;">Logout</button>
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
    localStorage.removeItem('vaultUser');
    location.reload();
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
    // Save to Recent
    let recent = JSON.parse(localStorage.getItem('recentGames')) || [];
    recent = [game, ...recent.filter(g => g.title !== game.title)].slice(0, 4);
    localStorage.setItem('recentGames', JSON.stringify(recent));

    document.getElementById('gameFrame').src = game.url;
    document.getElementById('gamePlayerContainer').style.display = 'block';
    document.getElementById('gameLibrary').style.display = 'none';
    document.getElementById('recentGames').style.display = 'none';
    displayRecent();
}

function closeGame() {
    document.getElementById('gameFrame').src = "";
    document.getElementById('gamePlayerContainer').style.display = 'none';
    document.getElementById('gameLibrary').style.display = 'block';
    document.getElementById('recentGames').style.display = 'block';
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
