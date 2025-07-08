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

import { CoreSetup, CoreStart, Plugin } from '../../../core/public';
import { BannerPluginSetup, BannerPluginStart } from './types';
import { renderBanner, unmountBanner, setInitialBannerHeight } from './render_banner';

export class BannerPlugin implements Plugin<BannerPluginSetup, BannerPluginStart> {
  constructor() {}

  public setup(core: CoreSetup): BannerPluginSetup {
    return {};
  }

  public async start(core: CoreStart): Promise<BannerPluginStart> {
    // Render the banner component and pass the HTTP client and UI settings
    // The initial banner height will be set in the renderBanner function
    renderBanner(core.http, core.uiSettings);

    return {};
  }

  public stop() {
    // Unmount the banner component
    unmountBanner();
  }
}
