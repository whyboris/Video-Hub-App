/// <reference lib="webworker" />

addEventListener('message', received);

function received(message: any): void {

  if (message.data.task === 1) {
    // console.log('task1');
    postMessage(getPotentialTwoWordTags(message.data.onlyFileNames, message.data.oneWordFreqMap));

  } else if (message.data.task === 2) {
    // console.log('task2');
    postMessage(getCleanTwoWordMap(message.data.potentialTwoWordMap, message.data.onlyFileNames));

  }
}

/**
 * Create the `twoWordFreqMap` by using the `potentialTwoWordMap` word map
 * Recount actual occurrences
 *
 *    Takes 4 seconds with 10,000 entries
 */
function getCleanTwoWordMap(
  potentialTwoWordMap: Map<string, number>,
  onlyFileNames: string[]
): Map<string, number> {

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

/**
 * Find potential two-word tags based on single word tags
 * @param onlyFileNames
 * @param oneWordFreqMap
 */
function getPotentialTwoWordTags(
  onlyFileNames: string[],
  oneWordFreqMap: Map<string, number>
): Map<string, number> {
  const potentialTwoWordMap: Map<string, number> = new Map();

  oneWordFreqMap.forEach((val: number, key: string) => {
    findTwoWords(
      potentialTwoWordMap,
      key,
      onlyFileNames,
      oneWordFreqMap
    );
  });

  return potentialTwoWordMap;
}

/**
 * Given a single word from tag list, look up following word
 * If on the list, add the two-word string to `potentialTwoWordMap`
 *
 * @param potentialTwoWordMap
 * @param singleWord
 * @param onlyFileNames
 * @param oneWordFreqMap
 */
function findTwoWords(
  potentialTwoWordMap: Map<string, number>, // THIS VARIABLE GETS UPDATED !!!
  singleWord: string,
  onlyFileNames: string[],
  oneWordFreqMap: Map<string, number>
): void {

  const filesContainingTheSingleWord: string[] = [];

  onlyFileNames.forEach((fileName) => {
    if (fileName.includes(singleWord)) {
      filesContainingTheSingleWord.push(fileName);
    }
  });

  filesContainingTheSingleWord.forEach((fileName) => {

    const filenameWordArray: string[] = fileName.split(' ');

    const numberIndex: number = filenameWordArray.indexOf(singleWord);
    const nextWord: string = filenameWordArray[numberIndex + 1];

    if (oneWordFreqMap.has(nextWord)) {
      const twoWordPair = singleWord + ' ' + nextWord;

      let currentOccurrences = potentialTwoWordMap.get(twoWordPair) || 0;
      currentOccurrences++;

      potentialTwoWordMap.set(twoWordPair, currentOccurrences);
    }

  });
}
