import 'i18next';
import type { TranslationResource } from './resources/sc';

// Typed `t()` keys, checked against the source language (sc).
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: TranslationResource };
  }
}
