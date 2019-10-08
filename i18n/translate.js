// YOU MUST SPECIFY THESE TWO:

// Add your Cloud Translations API key
const MY_GOOGLE_API_KEY = '';

// Set the language you'd like to translate into
// must be a 2-letter abbreviation that's on both lists:
// https://cloud.google.com/translate/docs/languages
// https://github.com/electron/electron/blob/master/docs/api/locales.md
const LANGUAGE_ABBREVIATION = '';

// =========================================================================
//    Do not edit below
// =========================================================================
const fs = require('fs');
const TJO = require('translate-json-object')();

TJO.init({
  googleApiKey: MY_GOOGLE_API_KEY,
});

// load English
let temp = fs.readFileSync('en.json');
let en = JSON.parse(temp);

// Translate method takes (source object, and language code)
TJO.translate(en, LANGUAGE_ABBREVIATION)
  .then(function(data) {
    fs.writeFileSync(LANGUAGE_ABBREVIATION + '.json', JSON.stringify(data));
    console.log('SUCCESS!');
  }).catch(function(err) {
    console.log('error ', err)
  });
