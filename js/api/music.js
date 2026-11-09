document.addEventListener("DOMContentLoaded", () => {

    const audio = document.getElementById("audioPlayer");
    const playButton = document.getElementById("playButton");
    const progress = document.getElementById("progress");

    const currentTime = document.getElementById("currentTime");
    const duration = document.getElementById("duration");
    const restartButton = document.getElementById("restartButton");

    // 재생 / 일시정지
    playButton.addEventListener("click", async () => {
        try {
            if (audio.paused) {
                await audio.play();
            } else {
                audio.pause();
            }
        } catch (error) {
            console.error("재생 오류:", error);
            message.textContent = "음악 재생에 실패했습니다.";
        }
    });

    // 재생 상태 표시
    audio.addEventListener("play", () => {
        playButton.textContent = "Ⅱ";
        message.textContent = "재생 중";
    });

    audio.addEventListener("pause", () => {
        playButton.textContent = "▶";
    });

    // 재생 시간 업데이트
    audio.addEventListener("timeupdate", () => {
        currentTime.textContent = formatTime(audio.currentTime);

        if (Number.isFinite(audio.duration)) {
            progress.value =
                (audio.currentTime / audio.duration) * 100;
        }
    });

    // 음악 길이 표시
    audio.addEventListener("loadedmetadata", () => {
        duration.textContent = formatTime(audio.duration);
    });

    // 음악 진행 위치 변경
    progress.addEventListener("input", () => {
        if (Number.isFinite(audio.duration)) {
            audio.currentTime =
                (progress.value / 100) * audio.duration;
        }
    });

    // 처음부터 다시 재생
    restartButton.addEventListener("click", () => {
        audio.currentTime = 0;
        audio.play().catch(error => console.error(error));
    });

    // 음악 종료
    audio.addEventListener("ended", () => {
        playButton.textContent = "▶";
        progress.value = 0;
    });

    const params = new URLSearchParams(location.search);
    const travelId = params.get("id");

    const travels = loadCards();

    const travel = travels.find(
        item => String(item.id) === String(travelId)
    ) || travels[0];

    const message = document.getElementById("musicMessage");

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60)
            .toString().padStart(2, "0");

        return `${min}:${sec}`;
    }

    if (!travel) {
        message.textContent = "등록된 여행이 없습니다.";
        playButton.disabled = true;
        return;
    }

    // 여행 정보 표시
    document.getElementById("travelLocation").textContent =
        `${travel.country} · ${travel.city}`;

    document.getElementById("travelRating").textContent =
        "★".repeat(travel.rating) +
        "☆".repeat(5 - travel.rating);

    document.getElementById("travelMemo").textContent =
        travel.memo || "";

    document.getElementById("memoText").textContent =
        travel.memo || "";

    document.getElementById("recordCountry").textContent =
        travel.country;

    document.getElementById("recordCity").textContent =
        travel.city;

    document.getElementById("travelImage").src =
        travel.imageUrl || "../assets/images/default.jpg";

    document.getElementById("songTitle").textContent =
        travel.song || "곡 제목 없음";

    document.getElementById("songArtist").textContent =
        travel.artist || "아티스트 없음";

    if (!travel.song) {
        message.textContent = "등록된 음악이 없습니다.";
        playButton.disabled = true;
        return;
    }

    // 음악 불러오기
    async function searchMusic() {

        message.textContent = "음악 불러오는 중...";

        // list.html에서 선택한 음악이 있으면 우선 사용
        if (travel.previewUrl) {

            audio.src = travel.previewUrl;

            document.getElementById("songTitle").textContent =
                travel.song || "곡 제목 없음";

            document.getElementById("songArtist").textContent =
                travel.artist || "아티스트 없음";

            if (travel.trackViewUrl) {
                const link = document.getElementById("openMusicLink");

                link.href = travel.trackViewUrl;
                link.hidden = false;
            }

            playButton.disabled = false;
            message.textContent = "음악 준비 완료";

            return;
        }

        // 저장된 미리듣기 주소가 없을 때만 iTunes 검색
        try {

            const term = `${travel.song} ${travel.artist || ""}`;

            const response = await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=15`
            );

            if (!response.ok) {
                throw new Error("검색 실패");
            }

            const data = await response.json();

            const normalize = value =>
                (value || "").toLowerCase()
                    .replace(/[^a-z0-9가-힣]/g, "");

            const song = normalize(travel.song);
            const artist = normalize(travel.artist);

            const result =
                data.results.find(item =>
                    normalize(item.trackName).includes(song) &&
                    (!artist ||
                        normalize(item.artistName).includes(artist))
                ) ||
                data.results.find(item =>
                    normalize(item.trackName).includes(song)
                );

            if (!result || !result.previewUrl) {
                message.textContent =
                    "재생 가능한 미리듣기가 없습니다.";
                return;
            }

            audio.src = result.previewUrl;

            document.getElementById("songTitle").textContent =
                result.trackName;

            document.getElementById("songArtist").textContent =
                result.artistName;

            if (result.trackViewUrl) {
                const link =
                    document.getElementById("openMusicLink");

                link.href = result.trackViewUrl;
                link.hidden = false;
            }

            playButton.disabled = false;
            message.textContent = "음악 준비 완료";

        } catch (error) {

            console.error(error);

            message.textContent =
                "음악을 불러오지 못했습니다.";

        }
    }
    searchMusic();

});