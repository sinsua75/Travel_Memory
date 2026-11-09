let selectedRating = 5;
let selectedMusic = null;
let editingTravelId = null;
let selectedReviewRating = 0;

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("travelModal");

    const addBtn = document.getElementById("addTravelBtn");

    const closeBtn = document.getElementById("closeModal");

    const submitBtn = document.getElementById("submitTravel");

    const ratingButtons =
        document.querySelectorAll("#ratingInput button");


    addBtn.addEventListener("click", () => {

        modal.classList.add("show");

    });


    closeBtn.addEventListener("click", () => {

        modal.classList.remove("show");

    });


    modal.addEventListener("click", (e) => {

        if (e.target === modal) {

            modal.classList.remove("show");

        }

    });


    ratingButtons.forEach(button => {

        button.addEventListener("click", () => {

            selectedRating =
                Number(button.dataset.rating);

            updateRating();

        });

    });

    submitBtn.addEventListener("click", createTravel);
    // 음악 검색
    document.getElementById("searchMusicBtn")
        .addEventListener("click", searchMusic);

    // 엔터로 검색
    document.getElementById("musicSearch")
        .addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                searchMusic();
            }
        });

    document.getElementById("searchInput")
        .addEventListener("input", renderTravels);

    document.getElementById("sortSelect")
        .addEventListener("change", renderTravels);

    // 후기 별점 선택
    document.querySelectorAll("#reviewRating button")
        .forEach(button => {

            button.addEventListener("click", () => {

                selectedReviewRating =
                    Number(button.dataset.rating);

                updateReviewRating();

            });

        });

    // 후기 저장
    document.getElementById("saveReview")
        .addEventListener("click", saveReview);
    renderTravels();

});


function updateRating() {

    const buttons =
        document.querySelectorAll("#ratingInput button");


    buttons.forEach(button => {

        const rating =
            Number(button.dataset.rating);

        button.classList.toggle(
            "active",
            rating <= selectedRating
        );

    });

}

async function searchMusic() {

    const keyword =
        document.getElementById("musicSearch").value.trim();

    const resultsBox =
        document.getElementById("musicSearchResults");

    if (!keyword) {
        alert("노래 제목이나 아티스트를 입력해주세요.");
        return;
    }

    resultsBox.textContent = "음악 검색 중...";

    try {

        const response = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&media=music&entity=song&limit=10`
        );

        const data = await response.json();

        resultsBox.innerHTML = "";

        if (!data.results.length) {
            resultsBox.textContent = "검색 결과가 없습니다.";
            return;
        }

        data.results.forEach(music => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "music-result";

            const image = document.createElement("img");
            image.src = music.artworkUrl100;
            image.alt = "";

            const info = document.createElement("span");
            info.textContent =
                `${music.trackName} · ${music.artistName}`;

            button.append(image, info);

            button.addEventListener("click", () => {

                selectedMusic = {
                    song: music.trackName,
                    artist: music.artistName,
                    previewUrl: music.previewUrl,
                    trackViewUrl: music.trackViewUrl,
                    artworkUrl: music.artworkUrl100
                };

                document.getElementById("song").value =
                    music.trackName;

                document.getElementById("artist").value =
                    music.artistName;

                const selected =
                    document.getElementById("selectedMusic");

                selected.textContent =
                    `♫ ${music.trackName} · ${music.artistName}`;

                resultsBox.innerHTML = "";

            });

            resultsBox.appendChild(button);

        });

    } catch (error) {

        console.error(error);

        resultsBox.textContent =
            "음악 검색에 실패했습니다.";

    }
}

function createTravel() {

    const country =
        document.getElementById("country").value;

    const city =
        document.getElementById("city").value;

    const date =
        document.getElementById("date").value;

    const song =
        document.getElementById("song").value;

    const artist =
        document.getElementById("artist").value;

    const memo =
        document.getElementById("memo").value;

    const visited =
        document.getElementById("visited").checked;


    if (!country || !city) {

        alert("국가와 도시를 입력해주세요.");

        return;

    }


    const travelData = {

        country: country,
        city: city,
        date: date,
        song: song,
        artist: artist,

        previewUrl: selectedMusic?.previewUrl || "",
        trackViewUrl: selectedMusic?.trackViewUrl || "",
        artworkUrl: selectedMusic?.artworkUrl || "",

        memo: memo,
        rating: selectedRating,
        visited: visited

    };

    // 수정 모드라면 기존 여행 갱신
    if (editingTravelId !== null) {

        updateTravel(Number(editingTravelId), travelData);

        editingTravelId = null;

    } else {

        // 일반 모드라면 새 여행 추가
        addCards({
            id: Date.now(),
            ...travelData
        });

    }

    renderTravels();

    closeModal();

    resetForm();

    document.getElementById("submitTravel").textContent =
        "◉　버킷리스트에 추가";

}

function renderTravels() {
    const travelList = document.getElementById("travelList");
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const sort = document.getElementById("sortSelect").value;

    const travels = loadCards().filter(travel =>
        (travel.country || "").toLowerCase().includes(keyword) ||
        (travel.city || "").toLowerCase().includes(keyword)
    );

    travels.sort((a, b) => {
        if (sort === "newest") return b.id - a.id;
        if (sort === "oldest") return a.id - b.id;
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "date") return (a.date || "9999").localeCompare(b.date || "9999");
        return 0;
    });

    travelList.innerHTML = "";

    travels.forEach(travel => {
        travelList.appendChild(createTravelCard(travel));
    });
}

function createTravelCard(travel) {

    const article =
        document.createElement("article");

    article.className = "travel-item";

    article.dataset.id = travel.id;

    article.addEventListener("click", () => {
        openDetail(travel);
    });


    const stars =
        "★".repeat(travel.rating) +
        "☆".repeat(5 - travel.rating);


    article.innerHTML = `

        <div class="travel-image">

            <img
                src="./images/default.jpg"
                alt="${travel.country} ${travel.city}"
            >

            ${travel.visited
            ? `<span class="visit-badge">
                    ✓ 방문 완료
                  </span>`
            : ""
        }

            <button class="favorite-btn">
                ♡
            </button>

            <div class="image-info">
                <span>${travel.country}</span>
            </div>

        </div>


        <div class="travel-info">

            <div class="travel-name">

                <h2>${travel.city}</h2>

                <div class="rating">
                    ${stars}
                </div>

            </div>


            <p class="music">
                ♫ ${travel.song} · ${travel.artist}
            </p>


            <p class="memo">
                ${travel.memo}
            </p>

            ${travel.visited && (travel.reviewMemo || travel.reviewRating) ? `
                <div class="review-preview">
                    <p>
                        후기 ${"★".repeat(travel.reviewRating || 0)}
                    </p>
                    <p>${travel.reviewMemo || ""}</p>
                </div>
            ` : ""}

            <div class="travel-bottom">

                <span class="date">
                    ${travel.date}
                </span>

                <div class="item-buttons">

                    <button class="edit-button" type="button">
                        ✎
                    </button>

                    <button class="lp-card-btn" type="button" aria-label="음악 재생" title="LP 재생">
                        ▶
                    </button>

                    <button class="share-btn">
                        ↗
                    </button>

                </div>

            </div>

        </div>

    `;

    article.querySelector(".lp-card-btn")
        .addEventListener("click", (e) => {
            e.stopPropagation();

            location.href =
                `./lp.html?id=${encodeURIComponent(travel.id)}`;
        });

    article.querySelector(".edit-button")
        .addEventListener("click", (e) => {
            e.stopPropagation();
            openDetail(travel);
        });

    // 카드 공유
    article.querySelector(".share-btn")
        .addEventListener("click", (e) => {

            e.stopPropagation();

            shareTravelCard(article, travel);

        });
    return article;

}


function closeModal() {

    const modal =
        document.getElementById("travelModal");

    modal.classList.remove("show");

}


function resetForm() {

    document.getElementById("country").value = "";

    document.getElementById("city").value = "";

    document.getElementById("date").value = "";

    document.getElementById("song").value = "";

    document.getElementById("artist").value = "";

    document.getElementById("memo").value = "";

    document.getElementById("visited").checked = false;

    selectedMusic = null;

    document.getElementById("musicSearch").value = "";

    document.getElementById("musicSearchResults").innerHTML = "";

    document.getElementById("selectedMusic").textContent =
        "선택된 음악이 없습니다.";

    selectedRating = 5;

    updateRating();



}

function openDetail(travel) {

    const modal =
        document.getElementById("detailModal");


    document.getElementById("detailCountry").textContent =
        `${travel.country} · ${travel.city}`;


    document.getElementById("detailDate").textContent =
        travel.date;


    document.getElementById("detailRating").textContent =
        "★".repeat(travel.rating) +
        "☆".repeat(5 - travel.rating);


    document.getElementById("detailSong").textContent =
        travel.song;


    document.getElementById("detailArtist").textContent =
        travel.artist;


    document.getElementById("detailMemo").textContent =
        travel.memo;


    const visited =
        document.getElementById("detailVisited");


    visited.style.display =
        travel.visited ? "block" : "none";

    // 방문 완료한 여행에만 후기 표시
    document.getElementById("detailReview").style.display =
        travel.visited ? "block" : "none";

    // 기존 후기 불러오기
    document.getElementById("reviewMemo").value =
        travel.reviewMemo || "";

    selectedReviewRating = travel.reviewRating || 0;

    updateReviewRating();
    document.getElementById("deleteTravel").dataset.id =
        travel.id;

    // 여행 수정 버튼
    const editButton =
        document.querySelector("#detailModal .edit-button");

    editButton.onclick = (e) => {

        e.stopPropagation();

        // 수정할 여행 ID 저장
        editingTravelId = travel.id;

        // 기존 정보 입력
        document.getElementById("country").value = travel.country;
        document.getElementById("city").value = travel.city;
        document.getElementById("date").value = travel.date || "";
        document.getElementById("song").value = travel.song || "";
        document.getElementById("artist").value = travel.artist || "";
        document.getElementById("memo").value = travel.memo || "";
        document.getElementById("visited").checked = travel.visited;

        // 기존 별점 반영
        selectedRating = travel.rating || 5;
        updateRating();

        // 기존 음악 정보 유지
        selectedMusic = {
            previewUrl: travel.previewUrl || "",
            trackViewUrl: travel.trackViewUrl || "",
            artworkUrl: travel.artworkUrl || ""
        };

        document.getElementById("selectedMusic").textContent =
            travel.song
                ? `♫ ${travel.song} · ${travel.artist}`
                : "선택된 음악이 없습니다.";

        // 상세 모달 닫기
        document.getElementById("detailModal")
            .classList.remove("show");

        // 수정 모달 열기
        document.getElementById("travelModal")
            .classList.add("show");
    };

    document.querySelector("#playTravelLp .lp-button").onclick = () => {
        location.href =
            `./lp.html?id=${encodeURIComponent(travel.id)}`;
    };

    modal.classList.add("show");

}

document
    .getElementById("deleteTravel")
    .addEventListener("click", (e) => {

        e.stopPropagation();

        const id =
            Number(e.currentTarget.dataset.id);

        const result =
            confirm("이 여행을 삭제하시겠습니까?");

        if (!result) {
            return;
        }

        deleteTravel(id);

        document
            .getElementById("detailModal")
            .classList.remove("show");

        renderTravels();

    });

document
    .getElementById("detailClose")
    .addEventListener("click", () => {

        document
            .getElementById("detailModal")
            .classList.remove("show");

    });

document
    .getElementById("detailModal")
    .addEventListener("click", (e) => {

        if (e.target.id === "detailModal") {

            e.currentTarget.classList.remove("show");

        }

    });

function updateReviewRating() {

    document.querySelectorAll("#reviewRating button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                Number(button.dataset.rating) <= selectedReviewRating
            );

        });

}


function saveReview() {

    const id = Number(
        document.getElementById("deleteTravel").dataset.id
    );

    const reviewMemo =
        document.getElementById("reviewMemo").value;

    updateTravel(id, {
        reviewMemo: reviewMemo,
        reviewRating: selectedReviewRating
    });

    alert("후기가 저장되었습니다.");

    renderTravels();

}

async function shareTravelCard(article, travel) {

    const canvas = await html2canvas(article, {
        scale: 2,
        backgroundColor: "#202124",
        useCORS: true
    });

    canvas.toBlob(async (blob) => {

        if (!blob) {
            alert("이미지 생성에 실패했습니다.");
            return;
        }

        const file = new File(
            [blob],
            `${travel.city}_travel.png`,
            { type: "image/png" }
        );

        // 이미지 공유 지원 여부 확인
        if (
            navigator.canShare &&
            navigator.canShare({ files: [file] })
        ) {

            try {

                await navigator.share({
                    title: `${travel.country} ${travel.city}`,
                    files: [file]
                });

            } catch (error) {

                if (error.name !== "AbortError") {
                    console.error(error);
                }

            }

        } else {

            // 공유 미지원 환경에서는 이미지 다운로드
            const link = document.createElement("a");

            link.download = file.name;
            link.href = canvas.toDataURL("image/png");

            link.click();

        }

    }, "image/png");

}