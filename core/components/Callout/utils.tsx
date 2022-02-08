import { AlertIcon, InfoIcon } from '../Icons';
import { CalloutVariant } from './types';

export const getVariantIcon = (variant: CalloutVariant): React.ReactNode => {
  switch (variant) {
    case 'info':
      return <InfoIcon />;
    case 'danger':
      return <AlertIcon />;
  }
};
