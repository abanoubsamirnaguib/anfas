import { IonButton } from '@ionic/react';
import { useI18n } from '../i18n';

export const LanguageToggle = () => {
  const { toggleLanguage, t } = useI18n();

  return (
    <IonButton
      onClick={toggleLanguage}
      style={{
        '--color': '#C9A96E',
        '--padding-start': '8px',
        '--padding-end': '8px',
        fontSize: '0.75rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      {t('languageToggle')}
    </IonButton>
  );
};
