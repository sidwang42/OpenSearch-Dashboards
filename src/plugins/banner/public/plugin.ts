/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Subscription } from 'rxjs';
import { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from '../../../core/public';
import { BannerPluginSetup, BannerPluginStart } from './types';
import { BannerService } from './services/banner_service';
import { setInitialBannerHeight } from './services/render_banner';
import { GlobalBanner } from './components/global_banner';

export class BannerPlugin implements Plugin<BannerPluginSetup, BannerPluginStart> {
  private readonly bannerService = new BannerService();
  private subscription: Subscription | undefined;

  constructor(private readonly initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup): BannerPluginSetup {
    // Get configuration from server
    const config = this.initializerContext.config.get() as any;

    // Setup banner with configuration values
    this.bannerService.setup({
      text: config.text,
      color: config.color,
      iconType: config.iconType,
      isVisible: config.isVisible,
      useMarkdown: config.useMarkdown,
    });

    return {};
  }

  public start(core: CoreStart): BannerPluginStart {
    const currentConfig = this.bannerService.getCurrentConfig();

    // Set initial height to prevent layout shifts
    setInitialBannerHeight(currentConfig.isVisible);

    // Use the headerBanner service to render the banner
    if (currentConfig.isVisible) {
      core.overlays.headerBanner.setHeaderBanner((element) => {
        // Render the banner component into the provided element
        ReactDOM.render(
          React.createElement(GlobalBanner, { bannerService: this.bannerService }),
          element
        );

        // Return an unmount callback
        return () => {
          ReactDOM.unmountComponentAtNode(element);
        };
      });
    }

    // Subscribe to banner config changes to update visibility
    this.subscription = this.bannerService.getBannerConfig$().subscribe((config) => {
      if (config.isVisible) {
        core.overlays.headerBanner.setHeaderBanner((element) => {
          // Render the banner component into the provided element
          ReactDOM.render(
            React.createElement(GlobalBanner, { bannerService: this.bannerService }),
            element
          );

          // Return an unmount callback
          return () => {
            ReactDOM.unmountComponentAtNode(element);
          };
        });
      } else {
        core.overlays.headerBanner.clearHeaderBanner();
      }
    });

    return {
      bannerService: this.bannerService,
    };
  }

  public stop() {
    // Clean up subscription if it exists
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // No need to unmount, the headerBanner service will handle cleanup
  }
}
