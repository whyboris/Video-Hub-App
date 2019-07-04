export interface ImportSettingsObject {
  exportFolderPath: string;
  generateClips: boolean;
  hubName: string;
  imgHeight: number;
  screensPerVideo: boolean; // true = N screenshots per video; false = 1 screenshot every N minutes
  ssConstant: number;
  ssVariable: number;
  videoDirPath: string;
}
