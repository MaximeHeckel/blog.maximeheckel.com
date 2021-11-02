import { css } from '@emotion/react';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const fill = React.useMemo(() => adjustSlider(value, min, max, disabled), [
    value,
    min,
    max,
    disabled,
  ]);

  return (
    <div
      css={css`
        width: 100%;
      `}
    >
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <StyledRange
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setRange(parseFloat(event.target.value))}
        fill={fill}
        disabled={disabled}
        {...rest}
      />
    </div>
  );
};

export default Range;
