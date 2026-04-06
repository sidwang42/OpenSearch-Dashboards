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
import { EuiLink } from '@elastic/eui';

/**
 * Regex to match URLs (http, https, ftp) in plain text.
 * Captures the full URL including path, query, and fragment.
 */
const URL_REGEX = /(https?:\/\/[^\s<>)"']+)/gi;

/**
 * Takes a plain string and returns React nodes where any URLs
 * are replaced with clickable EuiLink components that open in a new tab.
 */
export const AutoLinkText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(URL_REGEX);

  if (parts.length === 1) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <EuiLink key={i} href={part} target="_blank" external>
            {part}
          </EuiLink>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};
