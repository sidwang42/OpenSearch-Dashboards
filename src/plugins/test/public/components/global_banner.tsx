import React, { Fragment, useEffect, useState, Suspense, useRef, useCallback } from 'react';
import { EuiCallOut, EuiLoadingSpinner } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { BannerConfig } from '../../common';
import { BannerService } from '../services/banner_service';
import { bannerServiceInstance } from '../services/banner_service_instance';

const ReactMarkdownLazy = React.lazy(() => import('react-markdown'));

// Custom link renderer for markdown links to open in new tab
const LinkRenderer = (props: any) => {
  return (
    <a href={props.href} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
};

interface GlobalBannerProps {
  bannerService?: BannerService;
}

export const GlobalBanner: React.FC<GlobalBannerProps> = ({ bannerService }) => {
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Use the singleton instance if the prop is not provided
  const actualBannerService = bannerService || bannerServiceInstance;

  useEffect(() => {
    const subscription = actualBannerService.getBannerConfig$().subscribe((config) => {
      setBannerConfig(config);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [actualBannerService]);

  // Update the CSS variable with the banner's height
  useEffect(() => {
    // Add a smooth transition when changing banner visibility
    document.documentElement.style.transition = 'padding-top 0.3s ease';

    // If banner is not visible, set height to 0
    if (!bannerConfig?.isVisible) {
      document.documentElement.style.setProperty('--global-banner-height', '0px');

      // Reset the transition after a delay
      setTimeout(() => {
        document.documentElement.style.transition = '';
      }, 300);

      return;
    }

    // Set an initial non-zero value to ensure CSS takes effect
    document.documentElement.style.setProperty('--global-banner-height', '40px');

    // Reset the transition after a delay
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);

    // Use ResizeObserver to detect height changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Get height from ResizeObserver
        const height = entry.contentRect.height;

        // Set the CSS variable with the banner height
        document.documentElement.style.setProperty('--global-banner-height', `${height}px`);

        // Store the height in localStorage for persistence across page navigation
        try {
          localStorage.setItem('opensearch-dashboards-banner-height', `${height}`);
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    });

    if (bannerRef.current) {
      resizeObserver.observe(bannerRef.current);

      // Also set the height directly for immediate effect
      const height = bannerRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--global-banner-height', `${height}px`);
    }

    return () => {
      resizeObserver.disconnect();

      // Don't reset the height on page navigation - only when the banner is actually being hidden
      // We can detect this by checking if the banner config is still visible
      if (!bannerConfig || !bannerConfig.isVisible) {
        // Use a transition when removing the banner to prevent sudden layout shifts
        document.documentElement.style.transition = 'padding-top 0.3s ease';

        // Reset the height when banner is removed
        document.documentElement.style.setProperty('--global-banner-height', '0px');

        // Reset the transition after a delay
        setTimeout(() => {
          document.documentElement.style.transition = '';
        }, 300);
      }
    };
  }, [bannerConfig]);

  // Handle close button click
  const handleDismiss = useCallback(() => {
    // Update the UI setting to hide the banner
    actualBannerService.updateBannerConfig({
      isVisible: false,
    });
  }, [actualBannerService]);

  if (!bannerConfig || !bannerConfig.isVisible) {
    return null;
  }

  const renderContent = () => {
    if (bannerConfig.useMarkdown) {
      return (
        <Suspense
          fallback={
            <div>
              <EuiLoadingSpinner />
            </div>
          }
        >
          <ReactMarkdownLazy
            renderers={{
              root: Fragment,
              link: LinkRenderer,
            }}
            source={bannerConfig.text.trim()}
          />
        </Suspense>
      );
    }

    return (
      <FormattedMessage
        id="test.banner.text"
        defaultMessage="{text}"
        values={{ text: bannerConfig.text }}
      />
    );
  };

  return (
    <div ref={bannerRef}>
      <EuiCallOut
        title={renderContent()}
        color={bannerConfig.color}
        iconType={bannerConfig.iconType}
        dismissible={true}
        onDismiss={handleDismiss}
      />
    </div>
  );
};
