"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
    var newArray = __spreadArrays(arr);
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