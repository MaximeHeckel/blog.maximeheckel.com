import { Select as BaseSelect } from '@base-ui/react/select';
import { Icon } from '@maximeheckel/design-system';
import { useId } from 'react';

import {
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectPopup,
  SelectTrigger,
} from './Select.styles';

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
          <Icon.ChevronUpDown size={4} />
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
                    <Icon.Check variant="default" size={4} />
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
