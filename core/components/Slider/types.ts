export type SliderProps = {
  id?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  value: number;
  labelValue?: string;
  defaultValue?: number;
  hideDots?: boolean;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
};
