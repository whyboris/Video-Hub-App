import type { AllowedScreenshotHeight, InputSources } from './final-object.interface';

// meant to keep the full state of the Wizard settings chosen
export interface WizardOptions {
  clipHeight: AllowedScreenshotHeight; // height of clips to generate
  clipSnippetLength: number;  // length of each snippet in a clip
  clipSnippets: number;       // number of snippets to include in clip; 0 == do not extract clips
  extractClips: boolean;      // only used for UI, `clipSnippets` must be 0 to not extract clips
  futureHubName: string;
  isFixedNumberOfScreenshots: boolean;   // true = N screenshots per video; false = 1 screenshot every N minutes
  screenshotSizeForImport: AllowedScreenshotHeight;
  selectedOutputFolder: string;
  selectedSourceFolder: InputSources;
  showWizard: boolean;
  ssConstant: number;
  ssVariable: number;
}
