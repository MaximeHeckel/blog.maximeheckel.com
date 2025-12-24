export type SliderProps = {
  id?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  value: number;
  defaultValue?: number;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
};
