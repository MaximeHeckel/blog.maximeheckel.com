export interface PreviewTabsProps {
  selectedTab: Tab;
  onTabSelect: (tab: Tab) => void;
  onClear: () => void;
  onFullscreen: () => void;
  onToggleCode: () => void;
}

export type Tab = 'preview' | 'console';
