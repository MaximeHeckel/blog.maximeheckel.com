export interface PreviewTabsProps {
  selectedTab: Tab;
  onTabSelect: (tab: Tab) => void;
  onClear: () => void;
  onFullscreen: () => void;
}

export type Tab = 'preview' | 'console';
