export const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const;

export interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  id?: string;
  delayDuration?: number;
  side?: (typeof SIDE_OPTIONS)[number];
  sideOffset?: number;
  portalled?: boolean;
  visuallyHiddenText?: string;
}
