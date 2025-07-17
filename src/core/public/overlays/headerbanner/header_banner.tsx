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

import React, { useEffect, useRef } from 'react';
import { Observable } from 'rxjs';
import { MountPoint } from '../../types';

// This ID must match the one used in the banner plugin
const HEADER_BANNER_CONTAINER_ID = 'headerBannerContainer';

interface HeaderBannerProps {
  headerBanner$: Observable<MountPoint | undefined>;
}

/**
 * Component that renders the header banner content
 */
export const HeaderBanner: React.FC<HeaderBannerProps> = ({ headerBanner$ }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const unmountRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const subscription = headerBanner$.subscribe((mount) => {
      // Clean up previous mount if it exists
      if (unmountRef.current) {
        unmountRef.current();
        unmountRef.current = undefined;
      }

      // If there's no mount or no container, return early
      if (!mount || !containerRef.current) {
        return;
      }

      // Mount the new content
      unmountRef.current = mount(containerRef.current);
    });

    return () => {
      // Clean up subscription and unmount any mounted content
      subscription.unsubscribe();
      if (unmountRef.current) {
        unmountRef.current();
      }
    };
  }, [headerBanner$]);

  return <div id={HEADER_BANNER_CONTAINER_ID} ref={containerRef} />;
};
