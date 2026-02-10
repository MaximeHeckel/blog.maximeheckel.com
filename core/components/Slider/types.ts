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
  labelValue?: string;
  size?: 'sm' | 'md';
  hideDots?: boolean;
};
