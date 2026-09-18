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