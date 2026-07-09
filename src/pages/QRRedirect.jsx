import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../api/supabase';

const QRRedirect = () => {
  const { t } = useTranslation();
  const { slug } = useParams();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // 1. Buscamos el destino en la tabla
        const { data, error } = await supabase
          .from('qr_redirects')
          .select('destination_url')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          console.error('Destino no encontrado:', error);
          window.location.replace('/');
          return;
        }

        // 2. Incrementamos el contador de clics de forma segura en la base de datos
        await supabase.rpc('increment_qr_clicks', { target_slug: slug });

        // 3. Ejecutamos la redirección real
        window.location.replace(data.destination_url);

      } catch (err) {
        console.error('Error en el proceso de redirección:', err);
        window.location.replace('/');
      }
    };

    if (slug) {
      handleRedirect();
    }
  }, [slug]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
        <h2 className="text-xl font-semibold text-gray-700">{t('qrRedirect.connecting')}</h2>
        <p className="text-sm text-gray-400 mt-1">{t('qrRedirect.loadingCatalog')}</p>
      </div>
    </div>
  );
};

export default QRRedirect;