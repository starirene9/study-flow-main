import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    // Silently handle 404 - no console log
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t('common.pageNotFound')}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t('common.returnToHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
