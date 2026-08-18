export interface SettingsButton {
  title: string;
  description: string;
  toggled: boolean;         // default state unless user overrides
  hidden: boolean;          // hidden from the buttons ribbon by default (eye closed icon in settings)
  // Optional
  iconName?: string;        // if absent, defaults to `icon-default-button`
  moreInfo?: string;        // hint text in the settings menu when hovering over the `i` icon
  settingsHeading?: string; // Long text to appear in the settings above the button
}
