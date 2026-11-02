let selectedRating = 5;


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

    submitBtn.addEventListener("click", createTravel);

    document.getElementById("searchInput")
        .addEventListener("input", renderTravels);

    document.getElementById("sortSelect")
        .addEventListener("change", renderTravels);
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


    const travel = {

        id: Date.now(),

        country: country,

        city: city,

        date: date,

        song: song,

        artist: artist,

        memo: memo,

        rating: selectedRating,

        visited: visited

    };


    addCards(travel);

    renderTravels();

    closeModal();

    resetForm();

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


            <div class="travel-bottom">

                <span class="date">
                    ${travel.date}
                </span>

                <div class="item-buttons">

                    <button>
                        ✎
                    </button>

                    <button>
                        ♧
                    </button>

                </div>

            </div>

        </div>

    `;


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


    document.getElementById("deleteTravel").dataset.id =
        travel.id;


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