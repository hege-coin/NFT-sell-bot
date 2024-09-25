const jsonData = require('./rarity.json');


function getTextForRange(number) {
    switch (true) {
        case (number >= 1 && number <= 22):
            return 'Legendary';
        case (number > 22 && number <= 111):
            return 'Epic';
        case (number > 111 && number <= 444):
            return 'Rare';
        case (number > 444 && number <= 1111):
            return 'Uncommon';
        case (number > 1111 && number <= 2222):
            return 'Uncommon';
        default:
            return 'Out of range';
    }
}

const ranking = jsonData.result.data.items.find(obj => obj.mint === '4eu29PZhBe8VZzBEu2ZKPgU6dQtvztds1oo6efeXADyu');
const rank = ranking.rank
const tier = getTextForRange(rank);
console.log(rank,tier);