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

import { PluginInitializerContext, PluginConfigDescriptor } from '../../../core/server';
import { BannerPlugin } from './plugin';
import { configSchema, BannerPluginConfigType } from './config';

export const config: PluginConfigDescriptor<BannerPluginConfigType> = {
  exposeToBrowser: {
    content: true,
    color: true,
    iconType: true,
    isVisible: true,
    useMarkdown: true,
  },
  schema: configSchema,
  deprecations: ({ rename, unused }) => [
    (settings, fromPath, addDeprecation) => {
      if (settings?.banner?.externalLink) {
        settings.uiSettings = settings.uiSettings || {};
        settings.uiSettings.overrides = {
          ...(settings.uiSettings.overrides || {}),
          'banner:active': settings.banner.isVisible ?? true,
        };
      }

      return settings;
    },
  ],
};

export function plugin(initializerContext: PluginInitializerContext) {
  return new BannerPlugin(initializerContext);
}

export { BannerPluginSetup, BannerPluginStart } from './types';
