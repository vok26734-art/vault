function loadGame(url) {
    const container = document.getElementById('gamePlayerContainer');
    const frame = document.getElementById('gameFrame');
    
    frame.src = url;
    container.style.display = 'block';
    
    // Hide the libraries while playing
    document.getElementById('recentGames').style.display = 'none';
    document.getElementById('gameLibrary').style.display = 'none';
}

function closeGame() {
    const container = document.getElementById('gamePlayerContainer');
    const frame = document.getElementById('gameFrame');
    
    frame.src = "";
    container.style.display = 'none';
    
    // Show the libraries again
    document.getElementById('recentGames').style.display = 'block';
    document.getElementById('gameLibrary').style.display = 'block';
}

function toggleFullscreen() {
    const frame = document.getElementById('gameFrame');
    if (frame.requestFullscreen) {
        frame.requestFullscreen();
    }
}

// Basic search filter
document.getElementById('searchBar').addEventListener('input', (e) => {
    let filter = e.target.value.toLowerCase();
    let cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
        let title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(filter) ? "block" : "none";
    });
});
