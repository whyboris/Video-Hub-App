export interface SettingsButton {
  description: string;
  hidden: boolean;
  iconName: string;
  title: string;
  toggled: boolean;
  moreInfo?: string;        // hint text in the settings menu when hovering over the `i` icon
  settingsHeading?: string; // Long text to appear in the settings above the button
}
