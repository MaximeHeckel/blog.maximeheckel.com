export type EventType = 'keydown' | 'keyup';

export interface Config {
  separator?: string;
  orSeparator?: string;
  preventDefault?: boolean;
  eventType?: EventType;
}
