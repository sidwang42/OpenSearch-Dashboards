export const PLUGIN_ID = 'test';
export const PLUGIN_NAME = 'test';

export interface BannerConfig {
  text: string;
  color: 'primary' | 'warning' | 'danger';
  iconType?: string;
  isVisible: boolean;
  useMarkdown?: boolean;
  bannerUrl?: string;
}
