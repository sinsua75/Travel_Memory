function deleteCard(id) {
    const cards = loadCards();
    const newDeleteCardArr = cards.filter(card => card.id !== id);
    saveCards(newDeleteCardArr);
}

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