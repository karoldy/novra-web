import type { Meta, StoryObj } from '@storybook/react-vite';
import { useTranslation } from 'react-i18next';
import { expect } from 'storybook/test';
import { Typography } from '@/components/ui/typography';
import i18n, { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type Locale } from '@/i18n';
import { en } from '@/i18n/resources/en';
import { sc } from '@/i18n/resources/sc';
import { tc } from '@/i18n/resources/tc';
import { YStack } from '@/components/ui/stack';

const resources = { sc, tc, en };
const htmlLang: Record<Locale, string> = { sc: 'zh-CN', tc: 'zh-Hant', en: 'en' };

function Sample() {
  const { t } = useTranslation();
  return (
    <YStack className="gap-2" align="center">
      <Typography variant="heading2" data-testid="title">
        {t('app.title')}
      </Typography>
      {/* 骨 直 角 are drawn differently in TC and SC fonts. */}
      <Typography variant="subtitle1" data-testid="glyphs">
        骨 直 角 Aa
      </Typography>
    </YStack>
  );
}

const meta = {
  title: 'Foundations/I18n',
  component: Sample,
} satisfies Meta<typeof Sample>;

export default meta;
type Story = StoryObj<typeof meta>;

const firstCjkFont = (el: HTMLElement) =>
  getComputedStyle(el)
    .fontFamily.split(',')
    .map((f) => f.trim().replace(/["']/g, ''))
    .find((f) => / (TC|SC) Variable$/.test(f));

const expectedCjkFont: Record<Locale, string> = {
  tc: 'Noto Sans TC Variable',
  sc: 'Noto Sans SC Variable',
  en: 'Noto Sans TC Variable',
};

const localeStory = (locale: Locale): Story => ({
  globals: { locale },
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId('title')).toHaveTextContent(resources[locale].app.title);
    await expect(document.documentElement.lang).toBe(htmlLang[locale]);
    // Latin first, then the CJK font of the current language.
    await expect(firstCjkFont(canvas.getByTestId('glyphs'))).toBe(expectedCjkFont[locale]);
  },
});

export const SimplifiedChinese = localeStory('sc');
export const TraditionalChinese = localeStory('tc');
export const English = localeStory('en');

// Mixed content: a sc snippet inside the current page picks up the SC font.
export const MixedLanguage: Story = {
  globals: { locale: 'tc' },
  render: () => (
    <p className="text-body1">
      <span data-testid="tc">骨 直 角</span> /{' '}
      <span lang="zh-CN" data-testid="sc">
        骨 直 角
      </span>
    </p>
  ),
  play: async ({ canvas }) => {
    await expect(firstCjkFont(canvas.getByTestId('tc'))).toBe('Noto Sans TC Variable');
    await expect(firstCjkFont(canvas.getByTestId('sc'))).toBe('Noto Sans SC Variable');
  },
};

// The chosen language is saved and restored on the next load.
export const RemembersLocale: Story = {
  globals: { locale: 'sc' },
  play: async ({ canvas }) => {
    try {
      await i18n.changeLanguage('en');
      await expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
      await expect(await canvas.findByText(en.app.title)).toBeVisible();
    } finally {
      await i18n.changeLanguage('sc');
    }
    await expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('sc');
  },
};

const keyPaths = (value: unknown, prefix = ''): string[] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k))
    : [prefix];

// Guard: every locale has exactly the same keys as sc (the types already enforce this).
export const KeyParity: Story = {
  play: async () => {
    const source = keyPaths(resources.sc).sort();
    for (const locale of SUPPORTED_LOCALES) {
      await expect(keyPaths(resources[locale]).sort(), locale).toEqual(source);
    }
  },
};
