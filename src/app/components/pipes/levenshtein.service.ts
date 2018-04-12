import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LevenshteinService {

  // map from index of element in array to lev distance from original word
  levDistMap: Map<number, number> = new Map();
  finalMapBehaviorSubject = new BehaviorSubject([]);

  currWord: string;

  constructor() { }

  /**
   * Reset the map to empty and set the new word to compare to
   */
  public restartWith(word: string) {
    this.currWord = word;
    this.levDistMap = new Map();
  }

  /**
   * Levenshtein implementation thanks to James Westgate
   */
  public levDist=function(r,a){
    let t=[],f=r.length,n=a.length;
    if(0==f)return n;
    if(0==n)return f;
    for(let v=f;v>=0;v--)t[v]=[];
    for(let v=f;v>=0;v--)t[v][0]=v;
    for(let e=n;e>=0;e--)t[0][e]=e;
    for(let v=1;f>=v;v++)for(let h=r.charAt(v-1),e=1;n>=e;e++){if(v==e&&t[v][e]>4)return f;
    let i=a.charAt(e-1),o=h==i?0:1,c=t[v-1][e]+1,u=t[v][e-1]+1,A=t[v-1][e-1]+o;
    c>u&&(c=u),c>A&&(c=A),t[v][e]=c,v>1&&e>1&&h==a.charAt(e-2)&&r.charAt(v-2)==i&&(t[v][e]=Math.min(t[v][e],t[v-2][e-2]+o))}return t[f][n]
  };

  /**
   * Update map with index => levDistance pair for every new file
   * @param index     index within original array
   * @param filename  filename of file to compare to current word
   */
  public processThisWord(index: number, filename: string): void {
    this.levDistMap.set(index, this.levDist(this.currWord, filename));
  }

  /**
   * Get word with least lev distance,
   * remove it from the map,
   * and return its index
   */
  private getClosest() {
    let currLevDist: number = 10000;
    let currBestMatch: number = 0;

    this.levDistMap.forEach((value, key) => {
      if (value < currLevDist) {
        currLevDist = value;
        currBestMatch = key;
      }
    });

    this.levDistMap.delete(currBestMatch);

    return currBestMatch;
  }

  /**
   * Return in order of smallest lev distance to largest at most 9
   */
  public getIndexesByLevDistance(): number[] {
    const finalResult = []; // array of objects
    for (let i = 0; i < 9; i++) {
      if (this.levDistMap.size > 0) {
        finalResult[i] = this.getClosest();
      }
    }

    return finalResult;
  }

}
