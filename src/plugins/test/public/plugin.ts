import React from 'react';
import ReactDOM from 'react-dom';
import { I18nProvider } from '@osd/i18n/react';
import { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from '../../../core/public';
import { TestPluginSetup, TestPluginStart } from './types';
import { bannerServiceInstance } from './services/banner_service_instance';
import { GlobalBanner } from './components/global_banner';
import { TestPluginConfig } from '../server/config';

export class TestPlugin implements Plugin<TestPluginSetup, TestPluginStart> {
  private readonly initializerContext: PluginInitializerContext;

  constructor(initializerContext: PluginInitializerContext) {
    this.initializerContext = initializerContext;
  }

  public setup(core: CoreSetup): TestPluginSetup {
    // Initialize banner with config values
    const config = this.initializerContext.config.get<TestPluginConfig>();

    // Get banner text from config
    const bannerText = config.banner?.text;

    bannerServiceInstance.setup({
      text: bannerText,
      color: 'primary',
      iconType: 'iInCircle',
      isVisible: true,
      useMarkdown: true,
    });

    return {};
  }

  public start(core: CoreStart): TestPluginStart {
    // Connect banner service to UI settings
    bannerServiceInstance.connectToUiSettings(core.uiSettings);

    // Clear any stored banner height to prevent incorrect values from persisting
    try {
      localStorage.removeItem('opensearch-dashboards-banner-height');
    } catch (e) {
      // Ignore localStorage errors
    }

    // Get the current banner config to determine initial height
    const currentConfig = bannerServiceInstance.getCurrentConfig();

    // Set initial height based on banner visibility
    const initialHeight = currentConfig.isVisible ? '40px' : '0px';

    // Set an initial banner height to ensure headers are positioned correctly
    // This prevents layout shifts when the banner is enabled/disabled
    document.documentElement.style.setProperty('--global-banner-height', initialHeight);

    // Add to the globalBanner container immediately and retry if needed
    const renderBanner = () => {
      const globalBannerContainer = document.getElementById('globalBanner');

      if (globalBannerContainer) {
        // Render the banner into the globalBanner container
        ReactDOM.render(
          React.createElement(
            I18nProvider,
            null,
            React.createElement(GlobalBanner, { bannerService: bannerServiceInstance })
          ),
          globalBannerContainer
        );

        // Ensure the CSS variable is properly set by triggering a resize event
        // This helps components that depend on the banner height to adjust
        window.dispatchEvent(new Event('resize'));

        // Force a reflow to ensure the banner height is calculated correctly
        void document.body.offsetHeight;
      } else {
        // If the container isn't available yet, retry after a short delay
        setTimeout(renderBanner, 50);
      }
    };

    // Start the rendering process
    renderBanner();

    // Make the banner service available to other plugins
    return {
      bannerService: bannerServiceInstance,
    };
  }

  public stop() {
    // Clean up the banner when the plugin stops
    const globalBannerContainer = document.getElementById('globalBanner');
    if (globalBannerContainer) {
      ReactDOM.unmountComponentAtNode(globalBannerContainer);
    }

    // Disconnect banner service from UI settings
    bannerServiceInstance.disconnectFromUiSettings();
  }
}
