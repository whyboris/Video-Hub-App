// When new text has been added to English and you need to update all other files

// This script takes a template file `en.json` and a file that needs updating (e.g. `ru.json`)
// It will translate any new text that exists in `en.json` into target language
// It will delete any key-value pairs in target file that do not exist in the template

// https://cloud.google.com/translate/docs/languages
const TARGET_LANGUAGE = 'en'; // must coincide with the file name, e.g. `ru.json`

const API_KEY = '#################################_#####' // your Google API key

const fs = require('fs');

var TJO = require('translate-json-object')();

TJO.init({ googleApiKey: API_KEY });

const templateFile = fs.readFileSync('en.json');
const fileToUpdate = fs.readFileSync(TARGET_LANGUAGE + '.json');

const template = JSON.parse(templateFile);
const toUpdate = JSON.parse(fileToUpdate);

const objectToTranslate = getJsonDifference(template, toUpdate);

TJO.translate(objectToTranslate, TARGET_LANGUAGE)
    .then(function(translatedObject) {

      const final = mergeObjects(toUpdate, translatedObject);

      const cleaned = deleteOutdated(template, final);

      fs.writeFileSync(TARGET_LANGUAGE + '.json', JSON.stringify(cleaned));
      console.log('translation successful!');

    }).catch(function(err) {
      console.log('error ', err)
    });

// =================================================================================================
// Helper methods
// -------------------------------------------------------------------------------------------------

function getKeys(anyObj) {
  return Object.keys(anyObj);
}

/**
 * Delete from `newObject` any key-value pairs that do not exist in `templateObject`
 * @param templateObject
 * @param newObject
 */
function deleteOutdated(templateObject, newObject) {

  const categories = getKeys(newObject);

  const result = {};

  categories.forEach((category) => {

    result[category] = {};

    const names = getKeys(newObject[category]);

    names.forEach((name) => {

      if (!templateObject[category][name]) {
        delete newObject[category][name];
      }

    });
  });

  return newObject;
}

/**
 * Merges the `newAdditions` into `incompleteObject`
 * @param incompleteObject
 * @param newAdditions
 */
function mergeObjects(incompleteObject, newAdditions) {

  const categories = getKeys(newAdditions);

  categories.forEach((category) => {

    const names = getKeys(newAdditions[category]);

    if (!incompleteObject[category]) {
      incompleteObject[category] = {};
    }

    names.forEach((name) => {

      incompleteObject[category][name] = newAdditions[category][name];

    });

  });

  return incompleteObject;
}

/**
 * Returns object with values that exist in `templateObject` but not in `incompleteObject`
 */
function getJsonDifference(templateObject, incompleteObject) {

  const categories = getKeys(templateObject);

  const result = {};

  categories.forEach((category) => {

    result[category] = {};

    const names = getKeys(templateObject[category]);

    names.forEach((name) => {

      if (!incompleteObject[category] || !incompleteObject[category][name]) {
        result[category][name] = templateObject[category][name];
      }

    });
  });

  return result;
}
