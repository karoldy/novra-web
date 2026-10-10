import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { SUPPORTED_LOCALES } from '@/i18n';

function App() {
  const { t, i18n } = useTranslation();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Typography variant="heading1">{t('app.title')}</Typography>
      <div role="group" aria-label={t('locale.label')} className="flex gap-2">
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
      </div>
    </main>
  );
}

export default App;
