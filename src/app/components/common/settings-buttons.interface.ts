export interface SettingsButton {
  description: string;
  hidden: boolean;
  iconName: string;
  title: string;
  toggled: boolean;
  settingsHeading?: string; // Long text to appear in the settings above the button
}
