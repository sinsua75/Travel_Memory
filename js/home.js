function renderHome() {
    const cards = loadCards();

    if (cards.length === 0) {
        return;                                   // 저장된 게 없으면 기본 화면 그대로
    }

    document.getElementById("statTotal").textContent = cards.length;                             //  전체 개수
    document.getElementById("statVisited").textContent = filterCards(cards, "visited").length;    // ② 방문 완료 필터
    document.getElementById("statPending").textContent = filterCards(cards, "pending").length;    // ③ 예정 필터
    document.getElementById("statFavorite").textContent = filterCards(cards, "favorite").length;   // ④ 즐겨찾기 필터

    const list = document.getElementById("homeCardList");
    list.innerHTML = "";

    cards.slice(-5).reverse().forEach((travel, index) => {
        const article = document.createElement("article");
        article.className = index === 0 ? "travel-card active-card" : "travel-card";

        article.innerHTML = `
            <img src="${travel.imageUrl}" alt="${travel.city}" referrerpolicy="no-referrer">
            <div class="card-gradient"></div>
            <div class="card-text">
                <span>${travel.country}</span>
                <strong>${travel.city}</strong>
            </div>
        `;

        list.appendChild(article);
    });
}

renderHome();