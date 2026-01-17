let debounceTimer;

const searchBar = document.getElementById("searchBar");
const backBtn = document.getElementById("backBtn");
const container = document.getElementById("songs");

function toggleNav(show) {
    backBtn.style.display = show ? "inline-block" : "none";
}

function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<span style='color:#1ed760'>$1</span>");
}

function displaySongs(songs, query = "") {
    container.innerHTML = "";

    songs.forEach(song => {
        const card = document.createElement("div");
        card.className = "song-card";

        card.innerHTML = `
            <h3>${highlight(song.track_name, query)}</h3>
            <p>${highlight(song.track_artist, query)}</p>
            <p class="genre-tag">${song.playlist_genre} • ${song.playlist_subgenre}</p>
            <div class="song-meta">
                <span><i class="fas fa-clock"></i> ${song.duration_min} min</span>
                <span><i class="fas fa-star"></i> ${song.track_popularity}</span>
            </div>
        `;

        container.appendChild(card);
    });
}

async function loadCategories() {
    toggleNav(false);

    const res = await fetch("/categories");
    const data = await res.json();

    let html = `
        <h3>Genres</h3>
        <div class="category-list">
    `;

    data.genres.forEach(g => {
        html += `<div class="genre-pill" onclick="filterByCategory('playlist_genre','${g}')">${g}</div>`;
    });

    html += `
        </div>
        <h3>Subgenres</h3>
        <div class="category-list">
    `;

    data.subgenres.forEach(s => {
        html += `<div class="genre-pill" onclick="filterByCategory('playlist_subgenre','${s}')">${s}</div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

async function filterByCategory(type, value) {
    toggleNav(true);

    const res = await fetch(`/filter?type=${type}&value=${encodeURIComponent(value)}`);
    const data = await res.json();

    displaySongs(data);
}

searchBar.addEventListener("input", e => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query === "") {
        loadCategories();
        return;
    }

    debounceTimer = setTimeout(async () => {
        const res = await fetch(`/songs?query=${query}`);
        const data = await res.json();

        // 🔥 OLD RELIABLE BEHAVIOR
        if (data.length === 0) {
            loadCategories();
            toggleNav(false);
            return;
        }

        toggleNav(true);
        displaySongs(data, query);
    }, 300);
});

backBtn.addEventListener("click", () => {
    searchBar.value = "";
    loadCategories();
});

loadCategories();
