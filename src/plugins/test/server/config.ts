import { schema, TypeOf } from '@osd/config-schema';
import { PluginConfigDescriptor, PluginInitializerContext } from '../../../core/server';
import { BannerConfig } from '../common';

export type TestPluginConfig = TypeOf<typeof configSchema>;

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
  banner: schema.object({
    text: schema.string({ defaultValue: 'This is a configurable banner' }),
    color: schema.string({ defaultValue: 'primary' }),
    iconType: schema.string({ defaultValue: 'iInCircle' }),
    isVisible: schema.boolean({ defaultValue: true }),
    bannerUrl: schema.maybe(schema.string()),
  }),
});

export const config: PluginConfigDescriptor<TestPluginConfig> = {
  exposeToBrowser: {
    banner: true,
  },
  schema: configSchema,
};

export function createConfig(initializerContext: PluginInitializerContext) {
  return initializerContext.config.get<TestPluginConfig>();
}
