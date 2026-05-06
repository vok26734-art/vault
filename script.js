// ADD YOUR GAMES HERE
const gamesList = [
    { 
        title: "Doodle Jump", 
        img: "https://via.placeholder.com/200x120", 
        url: "https://example.com/game1", 
        category: "action" 
    },
    { 
        title: "Retro Space", 
        img: "https://via.placeholder.com/200x120", 
        url: "https://example.com/game2", 
        category: "retro" 
    },
    { 
        title: "City Racer", 
        img: "https://via.placeholder.com/200x120", 
        url: "https://example.com/game3", 
        category: "action" 
    }
];

// Load the library on startup
window.onload = () => {
    displayGames(gamesList);
};

function displayGames(games) {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = ''; 

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${game.img}" alt="${game.title}">
            <h3>${game.title}</h3>
        `;
        card.onclick = () => loadGame(game.url);
        grid.appendChild(card);
    });
}

function loadGame(url) {
    document.getElementById('gameFrame').src = url;
    document.getElementById('gamePlayerContainer').style.display = 'block';
    document.getElementById('gameLibrary').style.display = 'none';
    document.getElementById('recentGames').style.display = 'none';
}

function closeGame() {
    document.getElementById('gameFrame').src = "";
    document.getElementById('gamePlayerContainer').style.display = 'none';
    document.getElementById('gameLibrary').style.display = 'block';
    document.getElementById('recentGames').style.display = 'block';
}

function filterCategory(cat) {
    if (cat === 'all') {
        displayGames(gamesList);
    } else {
        const filtered = gamesList.filter(g => g.category === cat);
        displayGames(filtered);
    }
}

// Search Logic
document.getElementById('searchBar').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = gamesList.filter(g => g.title.toLowerCase().includes(term));
    displayGames(filtered);
};
