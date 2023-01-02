export interface PreviewTabsProps {
  selectedTab: Tab;
  onTabSelect: (tab: Tab) => void;
  onClear: () => void;
}

export type Tab = 'preview' | 'console';
