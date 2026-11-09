function renderHome() {
    const cards = loadCards();

    if (cards.length === 0) {
        return;                                   // 저장된 게 없으면 기본 화면 그대로
    }

    const latest = cards[cards.length - 1];                          // 마지막 카드 = 가장 최근

    document.getElementById("heroCode").textContent = latest.country;     // 국가
    document.getElementById("heroTitle").textContent = `${latest.city}`;   // 도시
    document.getElementById("heroSong").textContent = latest.song;     // 노래 제목 키
    document.getElementById("heroArtist").textContent = latest.artist;

    document.querySelector(".hero-bg").style.backgroundImage =
    `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(18,19,22,0.75) 70%, #121316 100%), url("${latest.imageUrl}")`;

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