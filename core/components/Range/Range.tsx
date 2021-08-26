import useDebounce from '@theme/hooks/useDebouncedValue';
import React from 'react';
import Label from '../Label';
import { StyledRange } from './Styles';
import { RangeProps } from './types';
import { adjustSlider } from './utils';

const Range = (props: RangeProps) => {
  const {
    debounce = 0,
    step,
    id,
    disabled,
    max,
    min,
    onChange,
    value,
    label,
    ...rest
  } = props;
  const [range, setRange] = React.useState(value);
  const debouncedValue = useDebounce(range, debounce);

  React.useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const fill = React.useMemo(() => adjustSlider(range, min, max, disabled), [
    range,
    min,
    max,
    disabled,
  ]);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <StyledRange
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={range}
        onChange={(event) => setRange(parseFloat(event.target.value))}
        fill={fill}
        disabled={disabled}
        {...rest}
      />
    </div>
  );
};

export default Range;
