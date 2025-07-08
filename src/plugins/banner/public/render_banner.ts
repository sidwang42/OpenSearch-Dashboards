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
import { GlobalBanner } from './components/global_banner';
import { BANNER_CONTAINER_ID, DEFAULT_BANNER_HEIGHT, HIDDEN_BANNER_HEIGHT } from '../common';
import { HttpStart, CoreStart } from '../../../core/public';

/**
 * Sets the initial banner height based on visibility
 * @param isVisible Whether the banner is initially visible
 * @param isNewHomePage Whether the new home page experience is enabled
 */
export const setInitialBannerHeight = (isVisible: boolean, isNewHomePage?: boolean): void => {
  const initialHeight = isVisible ? DEFAULT_BANNER_HEIGHT : HIDDEN_BANNER_HEIGHT;
  document.documentElement.style.setProperty('--global-banner-height', initialHeight);
  // Toggle banner-visible class based on visibility and home page setting
  if (isVisible) {
    if (isNewHomePage) {
      document.documentElement.classList.add('banner-visible-new');
      document.documentElement.classList.remove('banner-visible');
    } else {
      document.documentElement.classList.add('banner-visible');
      document.documentElement.classList.remove('banner-visible-new');
    }
  } else {
    document.documentElement.classList.remove('banner-visible');
    document.documentElement.classList.remove('banner-visible-new');
  }
};

/**
 * Renders the banner component into the DOM
 * @param http The HTTP client
 * @param uiSettings Optional UI settings service
 */
export const renderBanner = (http: HttpStart, uiSettings?: CoreStart['uiSettings']): void => {
  const container = document.getElementById(BANNER_CONTAINER_ID);

  // Check if new home page is enabled
  const checkNewHomePageSetting = async () => {
    if (uiSettings) {
      try {
        const useNewHomePage = await uiSettings.get('home:useNewHomePage');
        // Update initial banner height with new home page setting
        setInitialBannerHeight(false, !!useNewHomePage);
      } catch (error) {
        // If we can't get the setting, default to false
        setInitialBannerHeight(false, false);
      }
    }
  };
  // Check new home page setting
  checkNewHomePageSetting();

  if (container) {
    ReactDOM.render(React.createElement(GlobalBanner, { http, uiSettings }), container);

    // Trigger resize and reflow for proper height calculation
    window.dispatchEvent(new Event('resize'));
    void document.body.offsetHeight;
  } else {
    setTimeout(() => renderBanner(http, uiSettings), 50);
  }
};

/**
 * Unmounts the banner component from the DOM
 */
export const unmountBanner = (): void => {
  const container = document.getElementById(BANNER_CONTAINER_ID);
  if (container) {
    ReactDOM.unmountComponentAtNode(container);
  }
};
