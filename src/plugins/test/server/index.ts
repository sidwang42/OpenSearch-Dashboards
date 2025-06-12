import { PluginInitializerContext } from '../../../core/server';
import { TestPlugin } from './plugin';
import { config } from './config';

export function plugin(initializerContext: PluginInitializerContext) {
  return new TestPlugin(initializerContext);
}

export { TestPluginSetup, TestPluginStart } from './types';
export { config };
