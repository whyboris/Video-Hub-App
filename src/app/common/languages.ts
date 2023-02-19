import type { SupportedLanguage } from './app-state';

// Languages
const Arabic     = require('../../../i18n/ar.json');
const Bengali    = require('../../../i18n/bn.json');
const Chinese    = require('../../../i18n/zh.json');
const Czech      = require('../../../i18n/cs.json');
const Dutch      = require('../../../i18n/nl.json');
const English    = require('../../../i18n/en.json');
const French     = require('../../../i18n/fr.json');
const German     = require('../../../i18n/de.json');
const Hindi      = require('../../../i18n/hi.json');
const Italian    = require('../../../i18n/it.json');
const Japanese   = require('../../../i18n/ja.json');
const Korean     = require('../../../i18n/ko.json');
const Malay      = require('../../../i18n/ms.json');
const Polish     = require('../../../i18n/pl.json');
const Portuguese = require('../../../i18n/pt.json');
const Russian    = require('../../../i18n/ru.json');
const Spanish    = require('../../../i18n/es.json');
const Turkish    = require('../../../i18n/tr.json');
const Ukrainian  = require('../../../i18n/uk.json');
const Vietnamese = require('../../../i18n/vi.json');

export const LanguageLookup: Record<SupportedLanguage, any> = {
  'ar': Arabic,
  'bn': Bengali,
  'cs': Czech,
  'de': German,
  'en': English,
  'es': Spanish,
  'fr': French,
  'hi': Hindi,
  'it': Italian,
  'ja': Japanese,
  'ko': Korean,
  'ms': Malay,
  'nl': Dutch,
  'pl': Polish,
  'pt': Portuguese,
  'ru': Russian,
  'tr': Turkish,
  'uk': Ukrainian,
  'vi': Vietnamese,
  'zh': Chinese,
};
