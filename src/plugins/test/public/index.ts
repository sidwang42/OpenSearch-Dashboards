import './index.scss';

import { TestPlugin } from './plugin';
import { PluginInitializerContext } from '../../../core/public';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin(initializerContext: PluginInitializerContext) {
  return new TestPlugin(initializerContext);
}
export { TestPluginSetup, TestPluginStart } from './types';
