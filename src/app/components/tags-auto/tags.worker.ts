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
 *    Used to take 3-5 seconds with 10,000 entries by rescanning all file
 *    names for every candidate pair. Now goes through file names once,
 *    takes well under 100ms.
 */
function getCleanTwoWordMap(
  potentialTwoWordMap: Map<string, number>,
  onlyFileNames: string[]
): Map<string, number> {

  const twoWordFreqMap: Map<string, number> = new Map();

  const candidatePairs: Set<string> = new Set();
  for (const [key, val] of potentialTwoWordMap) {
    if (val > 3) {
      candidatePairs.add(key);
    }
  }

  if (candidatePairs.size === 0) {
    return twoWordFreqMap;
  }

  for (const fileName of onlyFileNames) {

    const wordArray: string[] = fileName.split(' ');

    // a file could contain the same pair twice - only count it once per file,
    // same as the old .includes() check did
    const pairsInThisFile: Set<string> = new Set();

    for (let i = 0; i < wordArray.length - 1; i++) {
      const pair = wordArray[i] + ' ' + wordArray[i + 1];
      if (candidatePairs.has(pair)) {
        pairsInThisFile.add(pair);
      }
    }

    for (const pair of pairsInThisFile) {
      twoWordFreqMap.set(pair, (twoWordFreqMap.get(pair) || 0) + 1);
    }
  }

  return twoWordFreqMap;
}

/**
 * Find potential two-word tags based on single word tags
 * Used to loop through all file names once per single-word tag - now just
 * goes through the file names once
 * @param onlyFileNames
 * @param oneWordFreqMap
 */
function getPotentialTwoWordTags(
  onlyFileNames: string[],
  oneWordFreqMap: Map<string, number>
): Map<string, number> {
  const potentialTwoWordMap: Map<string, number> = new Map();

  for (const fileName of onlyFileNames) {

    const wordArray: string[] = fileName.split(' ');

    // only the first occurrence of a word counts, same as the old indexOf() did
    const seenWords: Set<string> = new Set();

    for (let i = 0; i < wordArray.length; i++) {
      const word = wordArray[i];

      if (seenWords.has(word) || !oneWordFreqMap.has(word)) {
        continue;
      }
      seenWords.add(word);

      const nextWord = wordArray[i + 1];

      if (nextWord !== undefined && oneWordFreqMap.has(nextWord)) {
        const twoWordPair = word + ' ' + nextWord;
        potentialTwoWordMap.set(twoWordPair, (potentialTwoWordMap.get(twoWordPair) || 0) + 1);
      }
    }
  }

  return potentialTwoWordMap;
}
