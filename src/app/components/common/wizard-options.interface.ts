import { ImageElement } from './final-object.interface';

// meant to keep the full state of the Wizard settings chosen
export interface WizardOptions {
  clipSnippets: number; // number of snippets to include in clip; 0 == do not extract clips
  extractClips: boolean; // only used for UI, `clipSnippets` must be 0 to not extract clips
  futureHubName: string;
  listOfFiles: ImageElement[];
  screensPerVideo: boolean; // true = N screenshots per video; false = 1 screenshot every N minutes
  screenshotSizeForImport: number;
  selectedOutputFolder: string;
  selectedSourceFolder: string;
  showWizard: boolean;
  ssConstant: number;
  ssVariable: number;
  totalImportSize: number;
  totalImportTime: number;
  totalNumberOfFiles: number;
}
