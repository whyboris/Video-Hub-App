/// <reference lib="webworker" />

addEventListener('message', received);

function received(message: any): void {
  console.log('logging inside worker!');

  console.log(message.data);

  postMessage(cleanTwoWordMap(message.data.potentialTwoWordMap, message.data.onlyFileNames));
};

/**
 * Create the `twoWordFreqMap` by using the `potentialTwoWordMap` word map
 * Recount actual occurrences
 *
 *    Takes 4 seconds with 10,000 entries
 */
function cleanTwoWordMap(potentialTwoWordMap: Map<string, number>, onlyFileNames: string[]): Map<string, number> {     // PURE FUNCTION !!!

  const twoWordFreqMap: Map<string, number> = new Map();

  potentialTwoWordMap.forEach((val: number, key: string) => {

    if (val > 3) { // set a variable here instead!
      let newCounter: number = 0;

      for (let i = 0; i < onlyFileNames.length; i++) {
        if (onlyFileNames[i].includes(key)) {
          newCounter++;
          twoWordFreqMap.set(key, newCounter);
        }
      }
    }
  });

  return twoWordFreqMap;
}
