# Adding new icons

Thank you for considering adding additional icons to Video Hub App!

It's pretty straight forward: all you need is an _SVG_ file!

## Steps

1. Create an _SVG_ file (you can use Illustrator or some other software)
 - please make sure it fits within 15 x 15 px square
 - for best rendering please align as many lines to the pixel grid as you can
2. Copy the _SVG_ definition into `svg-definitions.component.html` (at the bottom of the file for easier tracking of changes)
3. Create a unique and descriptive name for your icon
4. Reference the icon in any template with `<app-icon [icon]="'your-icon-name'">`
 - If it's an icon for a button, just add the icon name to the `iconName` field in the relevant button in `settings-buttons.ts`
5. Open a PR (Pull Request) with the changes.
