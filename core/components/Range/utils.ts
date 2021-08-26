export function adjustSlider(
  value: number,
  min: number,
  max: number,
  disabled?: boolean
) {
  // Calculate visible width
  const val = ((value - min) * 100) / (max - min);

  const fillLeft = 'var(--maximeheckel-form-input-active)';
  const fillLeftDisabled = 'var(--maximeheckel-form-input-focus)';
  const fillRight = 'var(--maximeheckel-form-input-disabled)';

  return `linear-gradient(to right, ${
    disabled ? fillLeftDisabled : fillLeft
  } ${val}%, ${fillRight} ${val}%)`;
}
