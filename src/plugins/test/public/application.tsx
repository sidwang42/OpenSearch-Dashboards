import React from 'react';
import ReactDOM from 'react-dom';
import { TestApp } from './components/app';
import { AppMountParameters } from '../../../core/public';

// Simplified render function that only renders the banner
export const renderApp = (_navigation: any, { element }: AppMountParameters) => {
  ReactDOM.render(<TestApp />, element);

  return () => ReactDOM.unmountComponentAtNode(element);
};
