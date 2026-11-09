function renderFavorites() {
    const list = document.getElementById("favoriteList");
    const favorites = filterCards(loadCards(), "favorite");        

    if (favorites.length === 0) {
        return;
    }

    list.innerHTML = "";

    document.getElementById("favoriteCount").textContent =
        `하트를 눌러둔 ${favorites.length}개의 여행만 모아봤어요`;  

    favorites.forEach(travel => {
        const article = document.createElement("article");
        article.className = "travel-item";

        article.innerHTML = `
            <div class="travel-image">
                <img src="${travel.imageUrl}" alt="${travel.city}" referrerpolicy="no-referrer">
                ${travel.visited ? `<span class="visit-badge">✓ 방문 완료</span>` : ""}
                <button class="favorite-btn active">♥</button>
                <div class="image-info"><span>${travel.country}</span></div>
            </div>
            <div class="travel-info">
                <div class="travel-name">
                    <h2>${travel.city}</h2>
                    <div class="rating">${"★".repeat(travel.rating)}${"☆".repeat(5 - travel.rating)}</div>
                </div>
                <p class="music">♫ ${travel.song} · ${travel.artist}</p>
                <p class="memo">${travel.memo}</p>
                <div class="travel-bottom">
                    <span class="date">${travel.date}</span>
                </div>
            </div>
        `;

        list.appendChild(article);
    });
}

renderFavorites();