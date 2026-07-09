import { useTranslation } from 'react-i18next';

function TopBanner() {
  const { t } = useTranslation();
  return (
    <div className="bg-blue-600 text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
      {t('topBanner.message')}
    </div>
  );
}
export default TopBanner;