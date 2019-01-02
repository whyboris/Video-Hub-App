import { ImageElement } from "./final-object.interface";
export interface WizardOptions {
  totalNumberOfFiles: number;
  listOfFiles: ImageElement[];
  totalImportTime: number;
  totalImportSize: number;
  selectedSourceFolder: string;
  selectedOutputFolder: string;
}
