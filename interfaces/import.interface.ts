import { AllowedScreenshotHeight } from "./final-object.interface";

export interface ImportSettingsObject {
  clipHeight: AllowedScreenshotHeight;
  clipSnippetLength: number;
  clipSnippets: number;
  exportFolderPath: string;
  hubName: string;
  imgHeight: AllowedScreenshotHeight;
  screensPerVideo: boolean; // true = N screenshots per video; false = 1 screenshot every N minutes
  ssConstant: number;
  ssVariable: number;
  videoDirPath: Record<number, string>;
}
