import { IonContent } from "@ionic/react";
import { useI18n } from '../i18n';

export const FilterModal = ({ filterCriteria, setFilterCriteria, dismiss, filters }) => {
  const { t } = useI18n();

  const filterProducts = (filter) => {
    setFilterCriteria(filter);
    dismiss();
  };

  return (
    <IonContent style={{ '--background': '#111111' }}>
      <div style={{ padding: '1rem 1.25rem' }}>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#C9A96E',
            margin: '0 0 1rem',
          }}
        >
          {t('filter.title')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => filterProducts(f)}
              style={{
                background: filterCriteria === f ? '#C9A96E' : '#1E1E1E',
                color: filterCriteria === f ? '#0C0C0C' : '#7A7A7A',
                border: filterCriteria === f ? '1px solid #C9A96E' : '1px solid #2A2A2A',
                borderRadius: '2px',
                padding: '7px 16px',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {t(`filters.${f}`, null, f)}
            </button>
          ))}
        </div>
      </div>
    </IonContent>
  );
};