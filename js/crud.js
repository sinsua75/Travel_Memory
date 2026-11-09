let currentStatus = "all";  // 지금 선택된 상태 필터 (all / visited / pending / favorite)
let selectedPreviewUrl = ""; // 노래 검색에서 고른 30초 미리듣기 주소
let currentAudio = null; // 지금 재생 중인 오디오 (새로 틀기 전에 멈추려고 기억)
let editingId = null; // 수정 중인 카드 id (null이면 새로 추가하는 중)


document.querySelectorAll(".status-filter button").forEach(button => {
    button.addEventListener("click", () => {
        currentStatus = button.dataset.status;
        document.querySelectorAll(".status-filter button").forEach(btn => {
            btn.classList.remove("active");
        });
        button.classList.add("active");
        renderTravels();
    });
});

// 지울 id가 아닌 카드만 filter로 남겨서 다시 저장한다
function deleteCard(id) {
    const cards = loadCards();
    const newDeleteCardArr = cards.filter(card => card.id !== id);
    saveCards(newDeleteCardArr);
}

// map으로 카드를 돌면서 id가 같은 카드만 새 값을 합쳐서(...) 덮어쓴다. 나머지는 그대로
function updateCard(id, updatedCard){
    const cards = loadCards();
    const newUpdateCardArr = cards.map(card => {
        if(card.id === id){
            return {
                ...card,
                ...updatedCard
            }
        }
        return card;
    });
    saveCards(newUpdateCardArr);

}

let selectedRating = 5;
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

        closeModal();

    });


    modal.addEventListener("click", (e) => {

        if (e.target === modal) {

            closeModal();

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

    document.getElementById("city")
    .addEventListener("blur", updatePreviewImage);
document.getElementById("country")
    .addEventListener("blur", updatePreviewImage);

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

        document.getElementById("songSearchBtn")
        .addEventListener("click", async () => {
            const keyword = document.getElementById("song").value.trim();

            const musics = await getMusic(keyword);

            const box = document.getElementById("songResults");
            box.innerHTML = "";

            musics.forEach(music => {
                const item = document.createElement("div");
                item.textContent = music.trackName + " - " + music.artistName;

                item.addEventListener("click", () => {
                    document.getElementById("song").value = music.trackName;
                    document.getElementById("artist").value = music.artistName;
                    selectedPreviewUrl = music.previewUrl;
                    box.innerHTML = "";
                });
                box.appendChild(item);
            });
        });

    // 후기 저장
    document.getElementById("saveReview")
        .addEventListener("click", saveReview);
    renderTravels();

});

// 모달 위쪽 사진 미리보기. API 호출이 느려서 입력 중이 아니라 칸을 벗어날 때(blur)만 실행
async function updatePreviewImage() {
    const country = document.getElementById("country").value.trim();
    const city = document.getElementById("city").value.trim();

    if (!country || !city) return;               // 둘 중 하나라도 비어 있으면 아무것도 안 함

    const url = await getImage(`${country} ${city}`);     // ① 검색어: 국가 + 도시

    if (url) {
        document.getElementById("modalImage").style.backgroundImage =
            `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.05)), url("${url}")`;   // ② 받아온 주소
    }
    

    document.getElementById("modalImageText").textContent = `🌍　${country} · ${city}`;
}


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

// 사진 검색(getImage)을 기다려야 해서 async/await 사용
async function createTravel() {

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

    // 수정 모드: 새 카드를 만들지 않고 해당 카드만 업데이트한 뒤 return으로 끝낸다
    if(editingId !== null){
        const oldCard = loadCards().find(c => c.id === editingId);   // 수정 전 카드 찾기

        let newImageUrl = oldCard.imageUrl;                            // 기본은 기존 사진 유지

        if (oldCard.country !== country || oldCard.city !== city) {    // 도시 키
            newImageUrl = await getImage(`${country} ${city}`) || "../assets/images/default.jpg";
        }
        updateCard(editingId, {
            country: country,
            city: city,
            date: date,
            song: song,
            artist: artist,
            memo: memo,
            rating: selectedRating,
            visited: visited,
            previewUrl: selectedPreviewUrl,
            imageUrl: newImageUrl
        });

        editingId = null;
        renderTravels();
        closeModal();
        resetForm();
        selectedPreviewUrl = "";
        return;
    }
    const imageUrl = await getImage(`${country} ${city}`);


    const travelData = {

        country: country,
        city: city,
        date: date,
        song: song,
        artist: artist,


        memo: memo,
        rating: selectedRating,

        visited: visited,

        imageUrl: imageUrl || "../assets/images/default.jpg",

        previewUrl: selectedPreviewUrl || "",

        favorite: false

    };


        // 일반 모드라면 새 여행 추가
        addCards({
            id: Date.now(),
            ...travelData
        });


    renderTravels();

    closeModal();

    resetForm();

    selectedPreviewUrl = "";

}

// 상태 필터 → 검색어 → 정렬 순서로 거른 뒤 카드를 화면에 다시 그린다
function renderTravels() {
    const travelList = document.getElementById("travelList");
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const sort = document.getElementById("sortSelect").value;

    const travels = filterCards(loadCards(), currentStatus).filter(travel =>
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


    document.getElementById("travelCount").textContent =
        `총 ${loadCards().length}개의 여행 기록 중 ${travels.length}개를 보여드려요`;
}


// 카드 1장의 HTML을 만들고 ▶ ✎ ↗ ♡ 버튼 이벤트를 연결한다
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
                src="${travel.imageUrl}"
                alt="${travel.country} ${travel.city}"
                referrerpolicy="no-referrer"
            >

            ${travel.visited
            ? `<span class="visit-badge">
                    ✓ 방문 완료
                  </span>`
            : ""
        }

            <button class="favorite-btn">
                
                ${travel.favorite ? "❤" : "♡"}
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

                    ${travel.previewUrl ? `
                        <button class="preview-btn" data-preview="${travel.previewUrl}">
                            ▶
                        </button>
                    ` : ""}

                    <button class ="edit-btn">
                        ✎
                    </button>

                    <button class="lp-card-btn" type="button" aria-label="음악 재생" title="LP 재생">
                        ◉
                    </button>

                    <button class="share-btn">
                        ↗
                    </button>

                </div>

            </div>

        </div>

    `;

    const previewBtn = article.querySelector(".preview-btn");

    if(previewBtn) {
        previewBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            if(currentAudio) {
                // 이전 오디오를 멈춰서 소리가 겹치지 않게 한다
                currentAudio.pause();
            }

            currentAudio = new Audio(travel.previewUrl);
            currentAudio.play();
        });
    }

    const editBtn = article.querySelector(".edit-btn");

    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        editingId = travel.id;

        document.getElementById("country").value = travel.country;
        document.getElementById("city").value = travel.city;
        document.getElementById("date").value = travel.date;
        document.getElementById("song").value = travel.song;
        document.getElementById("artist").value = travel.artist;
        document.getElementById("memo").value = travel.memo;
        document.getElementById("visited").checked = travel.visited;

        selectedRating = travel.rating;
        updateRating();
        selectedPreviewUrl = travel.previewUrl || "";

         updatePreviewImage();      
        document.getElementById("travelModal").classList.add("show");
    });

    article.querySelector(".lp-card-btn")
        .addEventListener("click", (e) => {
            e.stopPropagation();
            location.href = `./lp.html?id=${travel.id}`;
        });

    // 카드 공유
    article.querySelector(".share-btn") // class 중에 찾으라고 .
        .addEventListener("click", (e) => {

            e.stopPropagation();

            shareTravelCard(article, travel);
            
        });

    article.querySelector(".favorite-btn")
        .addEventListener("click", (e) => {

            e.stopPropagation();

            updateCard(travel.id, { favorite: !travel.favorite });

            renderTravels();


        });
    return article;

}


function closeModal() {

    const modal =
        document.getElementById("travelModal");

    modal.classList.remove("show");

    editingId = null; // 모달을 닫으면 수정 모드도 해제한다

}


function resetForm() {

    document.getElementById("country").value = "";

    document.getElementById("city").value = "";

    document.getElementById("date").value = "";

    document.getElementById("song").value = "";

    document.getElementById("artist").value = "";

    document.getElementById("memo").value = "";

    document.getElementById("visited").checked = false;

    selectedRating = 5;

    updateRating();

     document.getElementById("modalImage").style.backgroundImage = "";
    document.getElementById("modalImageText").textContent = "🌍　국가를 입력하세요";  

}

// 카드를 누르면 그 카드의 값으로 상세 팝업을 채운다
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


    document.getElementById("detailImage").style.backgroundImage =
        `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.05)), url("${travel.imageUrl}")`;

    document.querySelector("#playTravelLp .lp-button").onclick = () => {     // ① LP 버튼의 class
        location.href = `./lp.html?id=${travel.id}`;                   // ② 카드 id
    };

    const favBtn = document.getElementById("detailFavorite");
    favBtn.textContent = travel.favorite ? "❤" : "♡";
    favBtn.dataset.id = travel.id;          // 카드 id
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

        deleteCard(id);

        document
            .getElementById("detailModal")
            .classList.remove("show");

        renderTravels();

    });

    document.getElementById("detailFavorite")
    .addEventListener("click", (e) => {
        e.stopPropagation();


        const id = Number(e.currentTarget.dataset.id);  
        const card = loadCards().find(c => c.id === id); 
        updateCard(id, { favorite: !card.favorite });             

        e.currentTarget.textContent = card.favorite ? "♡" : "❤";
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

    updateCard(id, {
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