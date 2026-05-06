// Function to load a game into the iframe
function loadGame(gameUrl) {
    const container = document.getElementById('gamePlayerContainer');
    const frame = document.getElementById('gameFrame');
    
    frame.src = gameUrl;
    container.style.display = 'block';

    // Save to "Recently Played" system
    saveToRecent(gameUrl);
}

// Function to close the player
function closeGame() {
    document.getElementById('gamePlayerContainer').style.display = 'none';
    document.getElementById('gameFrame').src = "";
}

// Search Logic
document.getElementById('searchBar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.game-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(term) ? 'block' : 'none';
    });
});

// Save to Local Storage for "Recently Played"
function saveToRecent(url) {
    let recent = JSON.parse(localStorage.getItem('vaultRecent')) || [];
    if (!recent.includes(url)) {
        recent.unshift(url); 
        if (recent.length > 6) recent.pop();
        localStorage.setItem('vaultRecent', JSON.stringify(recent));
    }
}
