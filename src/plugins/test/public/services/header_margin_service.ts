import { Subscription } from 'rxjs';
import { BannerService } from './banner_service';

/**
 * Sets the header top margin by adjusting the CSS variable
 * @param marginSize The margin size in pixels
 */
function setHeaderTopMargin(marginSize: number) {
  document.documentElement.style.setProperty('--global-banner-height', `${marginSize}px`);
}

/**
 * Resets the header top margin by setting the CSS variable to 0
 */
function resetHeaderTopMargin() {
  document.documentElement.style.setProperty('--global-banner-height', '0px');
}

export class HeaderMarginService {
  private subscription?: Subscription;
  private marginSize = 40; // Default banner height in pixels

  constructor(private bannerService: BannerService) {}

  /**
   * Start the service to adjust header margin based on banner visibility
   */
  public start() {
    this.subscription = this.bannerService.getBannerConfig$().subscribe((config) => {
      if (config.isVisible) {
        setHeaderTopMargin(this.marginSize);
      } else {
        resetHeaderTopMargin();
      }
    });
  }

  /**
   * Stop the service and clean up subscriptions
   */
  public stop() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
    resetHeaderTopMargin();
  }
}
