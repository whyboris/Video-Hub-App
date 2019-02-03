import { ImageElement } from './final-object.interface';

// meant to keep the full state of the Wizard settings chosen
export interface WizardOptions {
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
