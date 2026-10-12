import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { XStack, YStack } from '@/components/ui/stack';
import { Typography } from '@/components/ui/typography';
import { SUPPORTED_LOCALES } from '@/i18n';

function App() {
  const { t, i18n } = useTranslation();

  return (
    <YStack render={<main />} align="center" justify="center" className="min-h-svh gap-4">
      <Typography variant="heading1">{t('app.title')}</Typography>
      <XStack role="group" aria-label={t('locale.label')} className="gap-2">
        {SUPPORTED_LOCALES.map((locale) => (
          <Button
            key={locale}
            variant={i18n.language === locale ? 'default' : 'outline'}
            aria-pressed={i18n.language === locale}
            onClick={() => void i18n.changeLanguage(locale)}
          >
            {t(`locale.${locale}`)}
          </Button>
        ))}
      </XStack>
    </YStack>
  );
}

export default App;
