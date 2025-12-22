import { Select as BaseSelect } from '@base-ui/react/select';
import { useId } from 'react';

import {
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectPopup,
  SelectTrigger,
} from './Select.styles';

const ChevronUpDownIcon = ({ size = 24 }: { size?: number }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      color="currentColor"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 14C18 14 13.5811 19 12 19C10.4188 19 6 14 6 14" />
      <path d="M18 9.99996C18 9.99996 13.5811 5.00001 12 5C10.4188 4.99999 6 10 6 10" />
    </svg>
  );
};

const CheckIcon = ({ size = 24 }: { size?: number }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      color="currentColor"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 14L8.5 17.5L19 6.5" />
    </svg>
  );
};

export interface SelectProps {
  id?: string;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  items: { label: string; value: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
  minWidth?: number;
  disabled?: boolean;
}

const Select = (props: SelectProps) => {
  const { id, triggerRef, items, value, onChange, minWidth, disabled } = props;

  const generatedId = useId();

  const selectId = id || generatedId;

  return (
    <BaseSelect.Root items={items} value={value} onValueChange={onChange}>
      <SelectTrigger
        id={selectId}
        ref={triggerRef}
        disabled={disabled}
        style={{
          '--min-width': `${minWidth ?? 124}px`,
        }}
      >
        <BaseSelect.Value />
        <SelectIcon>
          <ChevronUpDownIcon size={16} />
        </SelectIcon>
      </SelectTrigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          alignItemWithTrigger={false}
          sideOffset={4}
          style={{
            outline: 'none',
            zIndex: 1,
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          <SelectPopup>
            <BaseSelect.List>
              {items.map(({ label, value }) => (
                <SelectItem key={label} value={value}>
                  {label}
                  <SelectItemIndicator>
                    <CheckIcon size={16} />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </BaseSelect.List>
          </SelectPopup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
};

export default Select;
