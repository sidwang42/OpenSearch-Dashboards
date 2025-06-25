import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IUiSettingsClient } from '../../../../core/public';
import { BannerConfig } from '../../common';

export class BannerService {
  private bannerConfig$ = new BehaviorSubject<BannerConfig>({
    text: 'Default banner text',
    color: 'primary',
    iconType: 'iInCircle',
    isVisible: false,
    useMarkdown: true,
  });

  private settingsSubscription?: Subscription;
  private uiSettings?: IUiSettingsClient;

  public setup(initialConfig: BannerConfig) {
    this.bannerConfig$.next(initialConfig);
  }

  public getBannerConfig$() {
    return this.bannerConfig$.asObservable();
  }

  public getCurrentConfig(): BannerConfig {
    return this.bannerConfig$.getValue();
  }

  public updateBannerConfig(config: Partial<BannerConfig>) {
    const newConfig = {
      ...this.bannerConfig$.getValue(),
      ...config,
    };
    this.bannerConfig$.next(newConfig);

    // Update UI settings if available
    if (this.uiSettings && config.isVisible !== undefined) {
      this.uiSettings.set('banner:visible', config.isVisible);
    }
  }

  /**
   * Connect the banner service with UI settings
   * @param uiSettings The UI settings client
   */
  public connectToUiSettings(uiSettings: IUiSettingsClient) {
    // Store the UI settings client for later use
    this.uiSettings = uiSettings;
    // Store the initial config from setup
    const initialConfig = this.bannerConfig$.getValue();

    const updateBanner = () => {
      const content = uiSettings.get('banner:content');
      const color = uiSettings.get('banner:color');
      const iconType = uiSettings.get('banner:iconType');
      const isVisible = uiSettings.get('banner:visible');
      const useMarkdown = uiSettings.get('banner:useMarkdown');

      // Always update all settings from UI settings
      this.updateBannerConfig({
        // If content is empty, use the initial text from config
        text: typeof content === 'string' && content.length > 0 ? content : initialConfig.text,
        color: color as 'primary' | 'success' | 'warning' | 'danger',
        iconType: iconType as string,
        isVisible: isVisible as boolean,
        useMarkdown: useMarkdown as boolean,
      });
    };

    // Initial update
    updateBanner();

    // Subscribe to changes in the UI settings
    this.settingsSubscription = uiSettings
      .getUpdate$()
      .pipe(
        filter(
          ({ key }) =>
            key === 'banner:content' ||
            key === 'banner:color' ||
            key === 'banner:iconType' ||
            key === 'banner:visible' ||
            key === 'banner:useMarkdown'
        )
      )
      .subscribe(() => updateBanner());
  }

  /**
   * Disconnect from UI settings
   */
  public disconnectFromUiSettings() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
      this.settingsSubscription = undefined;
    }
    this.uiSettings = undefined;
  }
}
