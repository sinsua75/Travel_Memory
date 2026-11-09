function filterCards(cards, status){
    if(status === "all"){
        return cards;
    }
    if(status === "visited"){
        return cards.filter(card => card.visited === true);
    }
    if(status === "favorite"){
        return cards.filter(card => card.favorite === true);   // ⑤ 즐겨찾기 키
    }
    return cards.filter(card => card.visited === false);
}
// 상태(전체/방문 완료/예정/즐겨찾기)에 맞는 카드만 골라서 돌려준다