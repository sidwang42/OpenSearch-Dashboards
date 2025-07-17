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
import { BehaviorSubject, Observable } from 'rxjs';
import { I18nStart } from '../../i18n';
import { MountPoint } from '../../types';

/** @public */
export interface OverlayHeaderBannerStart {
  /**
   * Set the header banner content
   *
   * @param mount {@link MountPoint} The React component to render in the header banner
   * @returns A function to clear the header banner
   */
  setHeaderBanner(mount: MountPoint): () => void;

  /**
   * Clear the current header banner
   */
  clearHeaderBanner(): void;

  /** @internal */
  getHeaderBanner$(): Observable<MountPoint | undefined>;
}

interface StartDeps {
  i18n: I18nStart;
}

/** @internal */
export class OverlayHeaderBannerService {
  private headerBanner$ = new BehaviorSubject<MountPoint | undefined>(undefined);

  public start({ i18n }: StartDeps): OverlayHeaderBannerStart {
    return {
      setHeaderBanner: (mount: MountPoint) => {
        this.headerBanner$.next(mount);
        return () => this.headerBanner$.next(undefined);
      },

      clearHeaderBanner: () => {
        this.headerBanner$.next(undefined);
      },

      getHeaderBanner$: () => {
        return this.headerBanner$.asObservable();
      },
    };
  }

  public stop() {
    this.headerBanner$.next(undefined);
  }
}
