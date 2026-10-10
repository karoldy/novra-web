import type { Preview } from '@storybook/react-vite';
import 'unfonts.css';
import '../src/index.css';
import i18n, { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '../src/i18n';
import { en } from '../src/i18n/resources/en';
import { sc } from '../src/i18n/resources/sc';
import { tc } from '../src/i18n/resources/tc';

const resources = { sc, tc, en };

function readLocale(value: unknown): Locale {
  return SUPPORTED_LOCALES.find((locale) => locale === value) ?? DEFAULT_LOCALE;
}

const preview: Preview = {
  // Toolbar language switcher; stories can pin one with `globals: { locale: 'tc' }`.
  globalTypes: {
    locale: {
      description: 'Locale',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        // Same order as SUPPORTED_LOCALES; each language named in its own script.
        items: SUPPORTED_LOCALES.map((value) => ({ value, title: resources[value].locale[value] })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: DEFAULT_LOCALE },
  // Switch before render so the story never paints in the previous language.
  async beforeEach(context) {
    await i18n.changeLanguage(readLocale(context.globals.locale));
  },
  parameters: {
    // Center every story in the canvas. Override per story with `parameters: { layout: 'fullscreen' }`.
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
};

export default preview;
