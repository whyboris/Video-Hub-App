"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Randomize the order of elements and return new array
 * Fisher-Yates (aka Knuth) Shuffle
 * https://stackoverflow.com/a/2450976/5017391
 * @param arr
 */
function randomizeArray(arr, currentIndex) {
    currentIndex = currentIndex ? currentIndex : 0;
    var temporaryValue;
    var randomIndex;
    var newArray = arr.slice();
    // While there remain elements to shuffle...
    while (currentIndex !== arr.length) {
        // Pick a remaining element...
        randomIndex = currentIndex + Math.floor(Math.random() * (arr.length - currentIndex));
        // And swap it with the current element.
        temporaryValue = newArray[currentIndex];
        newArray[currentIndex] = newArray[randomIndex];
        newArray[randomIndex] = temporaryValue;
        currentIndex += 1;
    }
    return newArray;
}
exports.randomizeArray = randomizeArray;
//# sourceMappingURL=utility.js.map