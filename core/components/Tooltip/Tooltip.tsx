import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import VisuallyHidden from '../VisuallyHidden';
import {
  DEFAULT_TOOLTIP_DELAY,
  DEFAULT_TOOLTIP_PORTALLED,
  DEFAULT_TOOLTIP_SIDE,
  DEFAULT_TOOLTIP_SIDE_OFFSET,
} from './Tooltip.constants';
import { StyledTooltipPopup } from './Tooltip.styles';
import { TooltipProps } from './Tooltip.types';

const Tooltip = (props: TooltipProps) => {
  const {
    children,
    content,
    delayDuration = DEFAULT_TOOLTIP_DELAY,
    id,
    portalled = DEFAULT_TOOLTIP_PORTALLED,
    side = DEFAULT_TOOLTIP_SIDE,
    sideOffset = DEFAULT_TOOLTIP_SIDE_OFFSET,
    visuallyHiddenText,
  } = props;

  const popupContent = (
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup render={<StyledTooltipPopup id={id} />}>
        {content}
        {visuallyHiddenText ? (
          <VisuallyHidden>{visuallyHiddenText}</VisuallyHidden>
        ) : null}
      </TooltipPrimitive.Popup>
    </TooltipPrimitive.Positioner>
  );

  return (
    <TooltipPrimitive.Provider delay={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger render={children as React.ReactElement} />
        {portalled ? (
          <TooltipPrimitive.Portal>{popupContent}</TooltipPrimitive.Portal>
        ) : (
          popupContent
        )}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

Tooltip.displayName = 'Tooltip';
Tooltip.Provider = TooltipPrimitive.Provider;

export default Tooltip;
