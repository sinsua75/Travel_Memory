async function getCountries(countryName) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        if(!response.ok){
            throw new Error('국가 정보를 찾을 수 없습니다');
        }
        const data = await response.json();
        console.log(data);
        const country = data[0];

        return {
            name: country.name.common,
            flag: country.flags.png,
        }

    }catch ( error ){
        console.log("국가 정보 가져오기 실패", error);
        return null;

    }

}

async function getImage(query) {
    try {
        const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo`);
        if(!response.ok){
            throw new Error('이미지를 찾을 수 없습니다');
        }
        const data = await response.json();
        console.log(data);
        const image = data.hits[0];
        return image.webformatURL;
    } catch (error) {
        console.log("이미지 가져오기 실패", error);
        return null;
    }

}

async function getMusic(query){
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=10`);
        if(!response.ok){
            throw new Error('음악 정보를 찾을 수 없습니다');
        }
        const data = await response.json();
        console.log(data);
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