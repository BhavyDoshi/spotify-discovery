const loader = document.getElementById('loader');
const resultsDiv = document.getElementById('results');

// Load categories on startup
window.onload = async () => {
    try {
        const res = await fetch('/categories');
        const data = await res.json();
        fillDropdown('genreSelect', data.genres);
        fillDropdown('subgenreSelect', data.subgenres);
    } catch (e) { console.error("Load failed", e); }
};

function fillDropdown(id, items) {
    const select = document.getElementById(id);
    items.forEach(item => {
        let opt = document.createElement('option');
        opt.value = item;
        opt.innerHTML = item;
        select.appendChild(opt);
    });
}

// Search Function
async function searchSongs() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    showLoader(true);
    try {
        const response = await fetch(`/songs?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        resultsDiv.innerHTML = "<p>Error loading data.</p>";
    } finally {
        showLoader(false);
    }
}

// Filter Function
async function filterData(type, value) {
    if (!value) return;
    showLoader(true);
    try {
        const response = await fetch(`/filter?type=${type}&value=${encodeURIComponent(value)}`);
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        resultsDiv.innerHTML = "<p>Error filtering data.</p>";
    } finally {
        showLoader(false);
    }
}

function showLoader(isVisible) {
    if (isVisible) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}

function displayResults(songs) {
    resultsDiv.innerHTML = "";
    if (songs.length === 0) {
        resultsDiv.innerHTML = "<p>No matches found.</p>";
        return;
    }

    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <h3>${song.track_name}</h3>
            <p style="color: #b3b3b3;">${song.track_artist}</p>
            <div style="font-size: 0.8em; margin-top: 10px;">
                <span>Popularity: ${song.track_popularity}</span><br>
                <span>Album: ${song.track_album_name}</span>
            </div>
        `;
        resultsDiv.appendChild(card);
    });
}
