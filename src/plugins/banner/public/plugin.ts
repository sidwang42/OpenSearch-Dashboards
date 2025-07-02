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

import { CoreSetup, CoreStart, Plugin, PluginInitializerContext } from '../../../core/public';
import { BannerPluginSetup, BannerPluginStart } from './types';
import { BannerService } from './services/banner_service';
import { BannerApiService } from './services/banner_api_service';
import { renderBanner, unmountBanner, setInitialBannerHeight } from './services/render_banner';
import { BannerConfig } from '../common';

export class BannerPlugin implements Plugin<BannerPluginSetup, BannerPluginStart> {
  private readonly bannerService = new BannerService();

  constructor(private readonly initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup): BannerPluginSetup {
    // Initialize with default values
    const defaultConfig: BannerConfig = {
      text: '',
      color: 'primary',
      iconType: '',
      isVisible: false,
      useMarkdown: false,
    };

    this.bannerService.setup(defaultConfig);

    return {};
  }

  public async start(core: CoreStart): Promise<BannerPluginStart> {
    // Create API service
    const apiService = new BannerApiService(core.http, this.bannerService);

    // Fetch banner configuration from API
    await apiService.fetchBannerConfig();

    // Get current config after API fetch
    const currentConfig = this.bannerService.getCurrentConfig();

    // Set initial height to prevent layout shifts
    setInitialBannerHeight(currentConfig.isVisible);

    // Render the banner component
    renderBanner(this.bannerService);

    return {
      bannerService: this.bannerService,
    };
  }

  public stop() {
    unmountBanner();
  }
}
