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

import { HttpSetup } from '../../../../core/public';
import { BannerConfig } from '../../common';
import { BannerService } from './banner_service';

interface BannerApiResponse {
  enabled: boolean;
  content?: string;
  color?: 'primary' | 'success' | 'warning';
  iconType?: string;
  isVisible?: boolean;
  useMarkdown?: boolean;
}

export class BannerApiService {
  private pollingInterval: number | undefined;

  constructor(private readonly http: HttpSetup, private readonly bannerService: BannerService) {}

  /**
   * Fetches banner configuration from the API
   */
  public async fetchBannerConfig(): Promise<void> {
    try {
      const response = await this.http.get<BannerApiResponse>('/api/_plugins/_banner/content');

      if (response.enabled) {
        this.bannerService.updateBannerConfig({
          text: response.content || '',
          color: response.color || 'primary',
          iconType: response.iconType || '',
          isVisible: response.isVisible !== undefined ? response.isVisible : true,
          useMarkdown: response.useMarkdown !== undefined ? response.useMarkdown : true,
        });
      } else {
        this.bannerService.updateBannerConfig({
          isVisible: false,
        });
      }
    } catch (error) {
      // Hide banner on error
      this.bannerService.updateBannerConfig({
        isVisible: false,
      });
    }
  }

  /**
   * Starts polling for banner configuration updates
   * @param intervalMs Polling interval in milliseconds (default: 60000 - 1 minute)
   */
  public startPolling(intervalMs: number = 60000): void {
    // Clear any existing interval
    this.stopPolling();

    // Set up new polling interval
    this.pollingInterval = window.setInterval(async () => {
      await this.fetchBannerConfig();
    }, intervalMs);
  }

  /**
   * Stops polling for banner configuration updates
   */
  public stopPolling(): void {
    if (this.pollingInterval !== undefined) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }
  }
}
