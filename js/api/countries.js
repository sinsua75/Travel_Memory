async function getCountries(countryName) {
    try {
        const response = await fetch(`https://api.restcountries.com/countries/v5/names.common?q=${countryName}`, {
            headers: { Authorization: `Bearer ${RESTCOUNTRIES_API_KEY}` }
        });
        if(!response.ok){
            throw new Error('국가 정보를 찾을 수 없습니다');
        }
        const data = await response.json();
        const country = data.data.objects[0];

        return {
            name: country.names.common,
            flag: country.flag.url_png,
        }

    }catch ( error ){
        console.log("국가 정보 가져오기 실패", error);
        return null;

    }

}

// getImage 위: 실패하면 null을 돌려주고, 호출한 쪽에서 기본 사진을 쓴다
async function getImage(query) {
    try {
        const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`);
        if(!response.ok){
            throw new Error('이미지를 찾을 수 없습니다');
        }
        const data = await response.json();
        const image = data.hits[0];
        return image.webformatURL;
    } catch (error) {
        console.log("이미지 가져오기 실패", error);
        return null;
    }

}

// getMusic 위: iTunes 검색 결과에서 필요한 값(곡명, 가수, 미리듣기 주소 등)만 골라서 돌려준다
async function getMusic(query){
    try { // try/catch 옆: 네트워크가 실패해도 앱이 멈추지 않게 한다
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=10`);
        if(!response.ok){
            throw new Error('음악 정보를 찾을 수 없습니다');
        }
        const data = await response.json();
        // console.log(data);
        const musicList = data.results.map(music => {
            return {
                trackName: music.trackName,
                artistName: music.artistName,
                previewUrl: music.previewUrl,
                artworkUrl100: music.artworkUrl100,
                trackTimeMillis: music.trackTimeMillis,

            }
        });

        return musicList;

    } catch (error) {
        console.log("음악 정보 가져오기 실패", error);
        return null;
    }
}