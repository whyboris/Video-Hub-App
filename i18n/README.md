# Adding a language

Thank you for considering adding an additional translation to Video Hub App!

# Setup
Translations take seconds using the _Google Translation API_ and the [translate-json-object](https://github.com/KhaledMohamedP/translate-json-object) library, but it does require a _Google Cloud API_ key (please use your own).

### How to get Google Could API Key
Navigate to the following [Wesbite](https://console.cloud.google.com/apis/credentials)

Log into your Google account and navigate to the "create credentials" section.
<img width="455" alt="Screen Shot 2022-09-11 at 4 47 28 PM" src="https://user-images.githubusercontent.com/56640569/189548240-ae30d21b-52cd-49fb-bf5d-bcbb235db063.png">

<i> <b>Note </b>: Do not embed API keys directly in code: API keys that are embedded in code can be accidentally exposed to the public, for example, if you forget to remove the keys from code that you share. Instead of embedding your API keys in your applications, store them in environment variables or in files outside of your application's source tree. </i>

Add those changes to your local repository!

Simply `cd i18n`, edit the `translate.js` file there to include your key and the target language abbreviation (e.g. `en`), and run (`node translate.js`).

<img width="518" alt="Screen Shot 2022-09-11 at 4 49 54 PM" src="https://user-images.githubusercontent.com/56640569/189548308-83ac27bf-bab7-46f0-9e23-80749d53bfa8.png">

For abbreviations please choose a 2-letter abbreviation that is on both lists:
- https://github.com/electron/electron/blob/master/docs/api/locales.md
- https://cloud.google.com/translate/docs/languages

After generating the `json` you may open a [pull request](https://github.com/whyboris/Video-Hub-App/pulls) or first integrate it into the app.

## Integrating the language into the app

You're welcome to open a _Pull Request_ as is (with just the new `.json` file) and I'll implement the language into the app. Alternatively, you can edit just a few more files and you'll be ready! It's rather easy -- just follow the patterns! Just edit these three files:

### `app-state.ts`

Add the two-letter abbreviation to the _type_, e.g.

```ts
export type SupportedLanguage = 'en' | 'ru' | 'fr';
```

### `settings.component.html`

Add the language to the dropdown in `settings.component.html`, e.g.

```html
<option value="en" [selected]="appState.language == 'en'">English</option>
<option value="ru" [selected]="appState.language == 'ru'">Русский</option>
<option value="fr" [selected]="appState.language == 'fr'">Française</option>
```

### `languages.ts`

Import the file into `languages.ts` with the other imports, e.g.

```ts
const English    = require('../../../i18n/en.json');
const Russian    = require('../../../i18n/ru.json');
const French     = require('../../../i18n/fr.json');
```

Update the `languageLookup` method, e.g.

```ts
  'en': English,
  'fr': French,
  'ru': Russian,
```

## Updating all language files

The `update.js` script will translate and add any new key-value pairs found in `en.json` into any of the translation files. It will also remove any key-value pairs that are not found in `en.json` from the translated file.
