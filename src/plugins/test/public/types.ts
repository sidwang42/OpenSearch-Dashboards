import { NavigationPublicPluginStart } from '../../navigation/public';
import { BannerService } from './services/banner_service';

/**
 * Intentionally empty for now as the plugin doesn't expose any setup functionality.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestPluginSetup {}

export interface TestPluginStart {
  bannerService: BannerService;
}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  test: TestPluginStart;
}
