export interface SettingsButton {
  description: string;
  hidden: boolean;          // hidden from the buttons ribbon by default (eye closed icon in settings)
  iconName?: string;        // if absent, defaults to `icon-default-button`
  title: string;
  toggled: boolean;         // default state unless user overrides
  moreInfo?: string;        // hint text in the settings menu when hovering over the `i` icon
  settingsHeading?: string; // Long text to appear in the settings above the button
}
