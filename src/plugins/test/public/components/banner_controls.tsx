import React, { useState, useEffect } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiSelect,
  EuiSwitch,
  EuiSpacer,
  EuiButton,
  EuiPanel,
} from '@elastic/eui';
import { BannerService } from '../services/banner_service';
import { bannerServiceInstance } from '../services/banner_service_instance';

interface BannerControlsProps {
  bannerService: BannerService;
}

export const BannerControls: React.FC<BannerControlsProps> = ({ bannerService }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('');
  const [iconType, setIconType] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [useMarkdown, setUseMarkdown] = useState(false);

  // Use the singleton instance if the prop is not provided
  const actualBannerService = bannerService || bannerServiceInstance;

  // Initialize form values from current banner config
  useEffect(() => {
    const subscription = actualBannerService.getBannerConfig$().subscribe((config) => {
      setText(config.text);
      setColor(config.color);
      setIconType(config.iconType || 'iInCircle');
      setIsVisible(config.isVisible);
      setUseMarkdown(config.useMarkdown || false);
    });
    return () => subscription.unsubscribe();
  }, [actualBannerService]);

  const colorOptions = [
    { value: 'primary', text: 'Primary' },
    { value: 'warning', text: 'Warning' },
    { value: 'danger', text: 'Danger' },
  ];

  const iconOptions = [
    { value: 'iInCircle', text: 'Info' },
    { value: 'checkInCircleFilled', text: 'Success' },
    { value: 'alert', text: 'Warning' },
    { value: 'error', text: 'Error' },
  ];

  const updateBanner = () => {
    actualBannerService.updateBannerConfig({
      text,
      color: color as 'primary' | 'warning',
      iconType,
      isVisible,
      useMarkdown,
    });
  };

  return (
    <EuiPanel>
      <EuiForm>
        <EuiFormRow label="Banner Text">
          {useMarkdown ? (
            <EuiTextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              fullWidth
            />
          ) : (
            <EuiFieldText value={text} onChange={(e) => setText(e.target.value)} />
          )}
        </EuiFormRow>

        <EuiFormRow label="Banner Color">
          <EuiSelect
            options={colorOptions}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </EuiFormRow>

        <EuiFormRow label="Icon Type">
          <EuiSelect
            options={iconOptions}
            value={iconType}
            onChange={(e) => setIconType(e.target.value)}
          />
        </EuiFormRow>

        <EuiFormRow>
          <EuiSwitch
            label="Show Banner"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
          />
        </EuiFormRow>

        <EuiFormRow>
          <EuiSwitch
            label="Use Markdown"
            checked={useMarkdown}
            onChange={(e) => setUseMarkdown(e.target.checked)}
          />
        </EuiFormRow>

        <EuiSpacer />

        <EuiButton onClick={updateBanner} fill>
          Update Banner
        </EuiButton>
      </EuiForm>
    </EuiPanel>
  );
};
