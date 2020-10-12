# Adding new icons

Thank you for considering adding additional icons to Video Hub App!

It's pretty straight forward: all you need is an _SVG_ file! 

## Steps <br><br>

1. Create an _SVG_ file (you can use Illustrator or any other vector graphic tool):

   - Please make sure it fits within <strong>15 x 15 px square.</strong>
   - For best rendering please align as many lines to the pixel grid as you can.<br><br>

2. Copy the _SVG_ definition into: <br> `svg-definitions.component.html` <br>(Note: Add at the bottom of the file for easier tracking of changes)<br><br>

3. Create a <em>unique and descriptive name </em> for your icon. <br><br>

4. Reference the icon in any template with `<app-icon [icon]="'your-icon-name'">`
   - If it's an icon for a button, just add the icon name to the `iconName` field in the relevant button in `settings-buttons.ts`
5. Open a PR (Pull Request) with the changes.
