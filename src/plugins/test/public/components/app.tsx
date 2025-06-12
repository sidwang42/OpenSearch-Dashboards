import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { GlobalBanner } from './global_banner';
import { bannerServiceInstance } from '../services/banner_service_instance';

export const TestApp = () => {
  return (
    <I18nProvider>
      <GlobalBanner bannerService={bannerServiceInstance} />
    </I18nProvider>
  );
};
