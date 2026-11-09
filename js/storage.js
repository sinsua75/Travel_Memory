const STORAGE_KEY = 'travel_memory_cards';

function loadCards(){
    const data = localStorage.getItem(STORAGE_KEY);
    if(!data){
        return []; // 한번도 저장 X -> 빈배열 (그래야 push 이런 오류 안남)
    }

    return JSON.parse(data); // 배열로 다시
}

function saveCards(cards){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function addCards(card) {

    const cards = loadCards();

    cards.push(card);

    saveCards(cards);
}

function deleteTravel(id) {

    const travels = loadCards();

    const newTravels = travels.filter(
        travel => travel.id !== id
    );

    saveCards(newTravels);
}

function updateTravel(id, updatedData) {

    const travels = loadCards();

    const newTravels = travels.map(travel =>
        travel.id === id
            ? { ...travel, ...updatedData }
            : travel
    );

    saveCards(newTravels);
}