# Adding a language

Thank you for considering adding an additional translation to Video Hub App!

Translations take seconds using the _Google Translation API_ and the [translate-json-object](https://github.com/KhaledMohamedP/translate-json-object) library, but it does require a _Google Cloud API_ key (please use your own).

Simply `cd i18n`, edit the `translate.js` file there to include your key and the target language abbreviation (e.g. `en`), and run (`node translate.js`).

For abbreviations please choose a 2-letter abbreviation that is on both lists:
- https://github.com/electron/electron/blob/master/docs/api/locales.md
- https://cloud.google.com/translate/docs/languages

After generating the `json` you may open a pull request or first integrate it into the app.

## Integrating the language into the app

You're welcome to open a _Pull Request_ as is (with just the new `.json` file) and I'll implement the language into the app. Alternatively, you can edit just a few more files and you'll be ready! It's rather easy -- just follow the patterns! Just edit these three files:

### `app-state.ts`

Add the two-letter abbreviation to the _type_, e.g.

```ts
export type SupportedLanguage = 'en' | 'ru' | 'fr';
```

### `home.component.html`

Add the language to the dropdown in `home.component.html`, e.g.

```html
  <select (change)="changeLanguage($event.target.value)" class="language-drop-down">
    <option value="en" [selected]="appState.language == 'en'">English</option>
    <option value="ru" [selected]="appState.language == 'ru'">Russian</option>
    <option value="fr" [selected]="appState.language == 'fr'">French</option>
  </select>
```

### `home.component.ts`

Import the file into `home.component.ts` with the other imports, e.g.

```ts
const English = require('../../../i18n/en.json');
const French = require('../../../i18n/fr.json');
const Russian = require('../../../i18n/ru.json)';
```

Add the _case_ to the _switch_ in the `changeLanguage` method, e.g.

```ts
  case 'ru':
    this.translate.use('ru');
    this.translate.setTranslation('ru', Russian);
    this.appState.language = 'ru';
    break;
```
