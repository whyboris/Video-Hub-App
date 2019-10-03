# Adding a language

Thank you for considering adding an additional translation to Video Hub App!

It's a 2 minute process when using the script (created by @cal2195) and [Google Doc Translate](https://translate.google.com/toolkit/docupload). Or if you are translating individual strings you can use [Google Translate](https://translate.google.com/).

## Steps

1. In your terminal enter this directory: `cd i18n`
2. Run the translate command: `./translate.sh German ge` (or `sh ./translate.sh German ge` for Mac users) substituting the language and the two-letter abbreviation
 - please use the first two letters from this list: https://github.com/electron/electron/blob/master/docs/api/locales.md
3. The instructions in the script will inform you:
> copy to_translate.txt contents into Google Translate, and paste the translations into a file called translated.txt
4. Once done, press the `Enter` key in your terminal and you're done!
5. Open a PR (Pull Request) with the changes.

## Integrating the language into the app

You're welcome to open a Pull Request as is and I'll implement the language into the app. Alternatively, you can edit just a few more files and you'll be ready! It's rather eays -- just follow the patterns!

1. The newly generated file will need a change: `export const English = {` -> to the appropriate language name
2. Add the two-letter abbreviation to `app-state.ts`, e.g.
```ts
export type SupportedLanguage = 'en' | 'ru' | 'fr';
```
3. Add the language to `home.component.html`, e.g.
```html
        <select (change)="changeLanguage($event.target.value)" class="languageDropDown">
          <option value="en" [selected]="appState.language == 'en'">English</option>
          <option value="ru" [selected]="appState.language == 'ru'">Russian</option>
          <option value="fr" [selected]="appState.language == 'fr'">French</option>
        </select>
```
4. Import the file into `home.component.ts`, e.g.
```ts
import { English } from '../../i18n/en';
import { French } from '../../i18n/fr';
import { Russian } from '../../i18n/ru';
```
5. Add the case to the `changeLanguage` method in `home.component.ts` e.g.
```ts
      case 'ru':
        this.translate.use('ru');
        this.translate.setTranslation('ru', Russian );
        this.appState.language = 'ru';
        break;
```